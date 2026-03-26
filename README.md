# chat-backend

## Requirements

- Node.js
- npm

## Install

```bash
npm install
```

## Running the app

```bash
npm run dev
```

This is the only command you need for local development.

## What happens when you run `npm run dev`

`onchange` starts watching all `src/**/*.ts` files for changes. On startup (`-i` flag) and on every file change it runs two steps sequentially:

1. **Lint** — Biome checks all files in `src/`. If any lint **errors** are found, the process stops and the server does not restart. Lint **warnings** do not stop the server.
2. **Build & run** — TypeScript compiles `src/` into `dist/`, then starts the server with `node dist/server.js`. If `tsc` fails, the server does not start.

The `-k` flag kills the previous server process before starting a new one, so there is never two instances running at the same time.

## Scripts reference

| Script      | Description                                           |
| ----------- | ----------------------------------------------------- |
| `dev`       | Watch `src/**/*.ts`, lint and rebuild on every change |
| `build:run` | Compile TypeScript and start the server once          |

---

## ReadEvents — How Unread Message Counts Work

### Overview

`ReadEvent` is a record that tracks the read/unread state of a specific message for a specific user. Every time a message is sent or its read state changes, the corresponding `ReadEvent` is **mutated** — `read` is toggled and `updatedAt` is updated.

---

### Structure

```typescript
type ReadEvent = {
  // [userId, messageId] serve as a composite identifier
  userId: string;
  messageId: string;
  read: boolean;
  createdAt: string; // equals the corresponding message's createdAt
  updatedAt: string; // updated on every read/unread toggle
};
```

---

### Creation Rules

When a message is sent, `N` ReadEvents are created — one per chat participant:

- **Sender** gets a `ReadEvent` with `read: true` (they authored it)
- **Every other participant** gets a `ReadEvent` with `read: false`

The `createdAt` of these initial events equals the message's `createdAt`.

```typescript
const readEvents: ReadEvent[] = foundChat.participants.map((participantId) => ({
  userId: participantId,
  messageId: message.id,
  read: participantId === user.id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));
```

---

### `read` field on `MessageDTO`

`MessageDTO` includes a `read` field resolved from the corresponding `ReadEvent`. It is used on the frontend to highlight unread messages within an open chat:

```typescript
type MessageDTO = Message & {
  senderName: string | null;
  status: MessageStatusEnum;
  read: boolean; // resolved from ReadEvent
};
```

It is resolved in `GET /chats/:chatId/messages` by finding the `ReadEvent` matching the message:

```typescript
const foundReadEvent = db.readEvents.find(
  (readEvent) => readEvent.messageId === msg.id,
);

return {
  ...msg,
  status: MessageStatusEnum.SENT,
  read: foundReadEvent.read,
  senderName: `${foundSender.firstName} ${foundSender.lastName}`,
};
```

---

### Computing `unreadMessages` on the API

The `unreadMessages` count on `ChatDTO` is computed in two steps inside `GET /chats`:

**Step 1 — Filter** all ReadEvents for the current user where `read: false`:

```typescript
const userUnreadEvents = db.readEvents.filter(
  (readEvent) => readEvent.userId === user.id && !readEvent.read,
);
```

**Step 2 — Narrow down** to events whose message belongs to the current chat:

```typescript
const chatUnreadEvents = userUnreadEvents.filter((unreadEvent) => {
  const unreadMessage = db.messages.find(
    (message) => message.id === unreadEvent.messageId,
  );

  if (!unreadMessage) {
    throw new Error("Unread message is not found");
  }

  return unreadMessage.chatId === chat.id;
});
```

**Step 3 — Count**: `chatUnreadEvents.length` → this is the `unreadMessages` value.

---

### Placement on `ChatDTO`

`unreadMessages` is placed at the root of `ChatDTO`. Since the backend already has the authenticated user in context when computing the chat list, the count is scoped to that user before the response is sent — so the frontend receives a ready-to-use number with no additional filtering needed.

```json
{
  "id": "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
  "type": "direct",
  "name": "Christopher Reynolds",
  "lastMessage": "It's about the plan for this week, nothing urgent though 🙂",
  "isOnline": false,
  "participants": [
    { "id": "2a1e4d9f-...", "name": "James Walker", "isTyping": false },
    { "id": "8e7d6c5b-...", "name": "Christopher Reynolds", "isTyping": false }
  ],
  "createdAt": "2024-01-08T10:00:00Z",
  "updatedAt": "2024-01-08T10:00:00Z",
  "unreadMessages": 2
}
```

---

### Concrete Example

#### Direct chat — Christopher Reynolds ↔ James Walker

Christopher Reynolds sent two messages that James Walker hasn't read yet:

| messageId (short)  | userId (short) | user                 | read  | createdAt | updatedAt | action                                                                        |
| ------------------ | -------------- | -------------------- | ----- | --------- | --------- | ----------------------------------------------------------------------------- |
| `d4e5f6g7-...-001` | `8e7d6c5b-...` | Christopher Reynolds | true  | 08:10     | 08:10     | Christopher Reynolds sent and read his message for James Walker               |
| `d4e5f6g7-...-001` | `2a1e4d9f-...` | James Walker         | false | 08:10     | 08:10     | James Walker has just received message from Christopher Reynolds (UNREAD)     |
| `d4e5f6g7-...-002` | `8e7d6c5b-...` | Christopher Reynolds | true  | 08:12     | 08:12     | Christopher Reynolds sent and read his new message for James Walker           |
| `d4e5f6g7-...-002` | `2a1e4d9f-...` | James Walker         | false | 08:12     | 08:12     | James Walker has just received new message from Christopher Reynolds (UNREAD) |

Filtering by `userId: James Walker` and `read: false` gives 2 events across all chats.
Then narrowing down to `chatId: 3425c4ce-...` (Christopher Reynolds chat) gives 2 events.

**Result: `unreadMessages = 2`** for James Walker in this chat.

---

#### Group chat — Plans & Hangouts

Two messages were sent — one by Olivia Brown, one by Daniel Harris. James Walker hasn't read either:

| messageId (short) | userId (short) | user          | read  | createdAt | updatedAt | action                                                                     |
| ----------------- | -------------- | ------------- | ----- | --------- | --------- | -------------------------------------------------------------------------- |
| `b9956344-...`    | `b5e2d3c4-...` | Olivia Brown  | true  | 08:15     | 08:15     | Olivia Brown sent and read her message                                     |
| `b9956344-...`    | `a4d1c2b3-...` | Emma Wilson   | true  | 08:15     | 08:16     | Emma Wilson has just received message from Olivia Brown and then read it   |
| `b9956344-...`    | `2a1e4d9f-...` | James Walker  | false | 08:15     | 08:15     | James Walker has just received message from Olivia Brown (UNREAD)          |
| `b9956344-...`    | `c9f0b5a3-...` | Daniel Harris | true  | 08:15     | 08:17     | Daniel Harris has just received message from Olivia Brown and then read it |
| `38fdc2c6-...`    | `c9f0b5a3-...` | Daniel Harris | true  | 08:20     | 08:20     | Daniel Harris sent and read his message                                    |
| `38fdc2c6-...`    | `a4d1c2b3-...` | Emma Wilson   | true  | 08:20     | 08:20     | Emma Wilson has just received message from Daniel Harris and then read it  |
| `38fdc2c6-...`    | `2a1e4d9f-...` | James Walker  | false | 08:20     | 08:20     | James Walker has just received message from Daniel Harris (UNREAD)         |
| `38fdc2c6-...`    | `b5e2d3c4-...` | Olivia Brown  | true  | 08:20     | 08:20     | Olivia Brown has just received message from Daniel Harris and then read it |

Filtering by `userId: James Walker` and `read: false` gives 2 events across all chats.
Then narrowing down to `chatId: b41ccd75-...` (Plans & Hangouts chat) gives 2 events.

**Result: `unreadMessages = 2`** for James Walker in this chat.

---

#### Group chat — Travel

One message was sent by Emma Wilson. Ryan Mitchell and Christopher Reynolds haven't read it:

| messageId (short) | userId (short) | user                 | read  | createdAt | updatedAt | action                                                                   |
| ----------------- | -------------- | -------------------- | ----- | --------- | --------- | ------------------------------------------------------------------------ |
| `3b7e1f9a-...`    | `a4d1c2b3-...` | Emma Wilson          | true  | 09:30     | 09:30     | Emma Wilson sent and read her message                                    |
| `3b7e1f9a-...`    | `b5e2d3c4-...` | Olivia Brown         | true  | 09:30     | 09:30     | Olivia Brown has just received message from Emma Wilson and then read it |
| `3b7e1f9a-...`    | `f1a2b3c4-...` | Ryan Mitchell        | false | 09:30     | 09:30     | Ryan Mitchell has just received message from Emma Wilson (UNREAD)        |
| `3b7e1f9a-...`    | `8e7d6c5b-...` | Christopher Reynolds | false | 09:30     | 09:30     | Christopher Reynolds has just received message from Emma Wilson (UNREAD) |

Filtering by `userId: Ryan Mitchell` and `read: false` gives 1 event across all chats.
Then narrowing down to `chatId: 9f3a7b2e-...` (Travel chat) gives 1 event.

**Result: `unreadMessages = 1`** for Ryan Mitchell in this chat.

Filtering by `userId: Christopher Reynolds` and `read: false` gives 1 event across all chats.
Then narrowing down to `chatId: 9f3a7b2e-...` (Travel chat) gives 1 event.

**Result: `unreadMessages = 1`** for Christopher Reynolds in this chat.

---

---

## Marking Messages as Read

### Overview

When a user views unread messages in an open chat, the client automatically detects visibility and emits a `chat:mark_as_read` event to the server. The server then mutates the corresponding `ReadEvent` records, and the client updates its local state optimistically.

---

### Frontend — Detecting Visible Messages

The client uses the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to track which unread messages are visible in the viewport. Only messages that belong to other participants are observed — the user's own messages are excluded:

```tsx
<div
  {...(!message.isMine && {
    ref: hook.observer.setMessageNodeRef(message.id),
  })}
  data-message-id={message.id}
>
```

Observed message IDs are collected into a `Set`. Every `MARK_AS_READ_TIMEOUT` milliseconds an interval fires and flushes the Set:

```typescript
const handleMarkAsRead = () => {
  if (!messageIdsToMarkAsRead.current.size) return;

  const messageIds = [...messageIdsToMarkAsRead.current];
  messageIdsToMarkAsRead.current.clear();

  // 1. Update local state optimistically
  // 2. Emit to server
  socket?.emit(CHAT_EVENTS.MARK_AS_READ, messageIds);
};
```

---

### Frontend — Optimistic State Update

Before emitting to the server, the client updates its local state immediately so the UI reflects the change without waiting for a server round-trip:

```typescript
// Mark messages as read
const updatedMessages = state.messages.map((msg) => {
  if (messageIdsSet.has(msg.id) && !msg.read) {
    return { ...msg, read: true };
  }
  return msg;
});

// Decrement unreadMessages counter per chat
const chatUnreadMessagesCounterMap = messageToMarkAsRead.reduce(
  (acc: Record<string, number>, itm) => {
    acc[itm.chatId] = (acc[itm.chatId] || 0) + 1;
    return acc;
  },
  {},
);

const updatedChats = state.chats?.map((chat) => ({
  ...chat,
  unreadMessages: Math.max(
    chat.unreadMessages - (chatUnreadMessagesCounterMap[chat.id] ?? 0),
    0,
  ),
}));
```

Two things are updated at once: the `read` flag on each message, and the `unreadMessages` counter on the corresponding chat in the sidebar.

---

### Frontend — Visual Indicators

Unread messages are visually distinguished in two ways:

```tsx
// 1. The message bubble gets an unread style class
className={`${styles.message} ${
  !message.read && !message.isMine ? styles.unreadMessage : ""
}`}

// 2. A small indicator dot is rendered inside the bubble
{!message.read && !message.isMine && (
  <span className={styles.unreadIndicator} />
)}
```

Both are removed once `read` is flipped to `true` in local state.

---

### Socket Event

| Direction       | Event               | Payload                  |
| --------------- | ------------------- | ------------------------ |
| Client → Server | `chat:mark_as_read` | `string[]` (message IDs) |

---

### Backend — Handler

The server listens for `chat:mark_as_read` and mutates the matching `ReadEvent` records in the database:

```typescript
export const markMessageAsReadHandler = (db: DB) => (messageIds: string[]) => {
  db.readEvents = db.readEvents.map((readEvent) => {
    if (messageIds.includes(readEvent.messageId)) {
      return {
        ...readEvent,
        read: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return readEvent;
  });
};
```

The handler updates **all** `ReadEvent` records whose `messageId` is in the incoming array — setting `read: true` and refreshing `updatedAt`. No acknowledgment is sent back to the client since the UI has already been updated optimistically.

---

### `read` field on `MessageDTO`

When messages are fetched via `GET /chats/:chatId/messages`, each message includes a `read` field resolved from the `ReadEvent` scoped to the **authenticated user**:

```typescript
const foundReadEvent = db.readEvents.find(
  (readEvent) => readEvent.messageId === msg.id && readEvent.userId === user.id,
);

return {
  ...msg,
  status: MessageStatusEnum.SENT,
  read: foundReadEvent.read,
  senderName: `${foundSender.firstName} ${foundSender.lastName}`,
};
```

This ensures each user sees their own read state — not another participant's.
