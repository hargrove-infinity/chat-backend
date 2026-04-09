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

When another participant reads the message, the corresponding ReadEvent is updated — its read field is set to true and updatedAt is refreshed.

---

### Message Status

A message can have one of the following statuses:

| Status    | Meaning                                                     |
| --------- | ----------------------------------------------------------- |
| `SENDING` | Optimistic — message is being sent to the server            |
| `SENT`    | Server confirmed delivery, not all participants read it yet |
| `READ`    | All chat participants have read the message                 |
| `ERROR`   | Message failed to send                                      |

The status is resolved in `GET /chats/:chatId/messages` on the backend by checking whether every `ReadEvent` for a given message has `read: true`:

```typescript
// True only if all chat participants (sender + recipients) have read this message
// Used to resolve message status: READ if everyone read it, SENT otherwise
const isReadMessage = db.readEvents
  .filter((readEvent) => readEvent.messageId === msg.id)
  .every((readEventByMessage) => readEventByMessage.read);
```

---

### `reads` field on `MessageDTO`

Each `MessageDTO` includes a `reads` array resolved from `ReadEvent` records. Its contents depend on message ownership:

- **Own messages** — contains read events for all other participants (excludes the sender), used to display who has read the message
- **Others' messages** — contains only the current user's read event, used to determine whether the current user has read it

This is resolved in `GET /chats/:chatId/messages` on the backend:

```typescript
/**
 * Resolve read events based on message ownership:
 * - Own messages: return read events for all other participants (excludes sender)
 *   to display who has read the message
 * - Others' messages: return only the current user's read event
 *   to display whether the current user has read it
 */
const messageReadReceipts = db.readEvents
  .filter((readEvent) => {
    const isAuthorMessage = msg.senderId === user.id;
    return (
      readEvent.messageId === msg.id &&
      (isAuthorMessage
        ? readEvent.userId !== msg.senderId
        : readEvent.userId === user.id)
    );
  })
  .map((readEvent) => ({
    userId: readEvent.userId,
    userName: `${user.firstName} ${user.lastName}`,
    read: readEvent.read,
  }));
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

## Read Receipts

Read receipts track whether participants have seen a message. The behavior differs between direct and group chats — in a direct chat a single recipient determines the read state, while in a group chat the message is only fully read once every participant has seen it.

---

### Direct Chat (2 participants)

1. Author sends a message — their own `ReadEvent` is immediately `read: true`, the recipient's is `read: false`
2. The message appears as **unread** for the recipient (highlighted bubble + indicator dot)
3. When the recipient scrolls the message into view, the client emits `chat:message_was_read`
4. The server updates the recipient's `ReadEvent` to `read: true`
5. The server notifies the author via `chat:notify_author_message_was_read`
6. The author's message status changes from **SENT** (single checkmark) to **READ** (eye icon) — indicating the other person has read it

---

### Group Chat (3+ participants)

1. Author sends a message — their own `ReadEvent` is `read: true`, all other participants get `read: false`
2. The message is **unread** for everyone who hasn't scrolled past it
3. As each participant views the message, `chat:message_was_read` is emitted and their `ReadEvent` is set to `read: true`
4. The author's message status changes to **READ** only when **all** participants have read it
5. The author can click the **"Seen"** button on their message to open a read receipt menu showing each participant's read status:

```
Read by 2 of 3
─────────────────────
Emma Wilson      ✉ (read)
James Walker     ✉ (unread)
```

---

### Visual Indicators

| Element            | Condition                            | Applies to |
| ------------------ | ------------------------------------ | ---------- |
| Highlighted bubble | `reads` contains current user unread | Incoming   |
| Indicator dot      | Same as above                        | Incoming   |
| Clock icon         | `status: SENDING`                    | Outgoing   |
| Checkmark icon     | `status: SENT`                       | Outgoing   |
| Eye icon           | `status: READ`                       | Outgoing   |
| "Seen" button      | Group chat, own message              | Outgoing   |
| Read receipt menu  | Group chat, own message, on click    | Outgoing   |

---

## Automatic Read Detection

### Overview

When a user views unread messages in an open chat, the client automatically detects visibility via the Intersection Observer API and emits `chat:message_was_read` to the server. The server updates the corresponding `ReadEvent` records and notifies the message author(s). The client updates local state optimistically without waiting for the server round-trip.

---

### Frontend — Detecting Visible Messages

Only unread messages from other participants are observed — the user's own messages are excluded:

```tsx
<div
  {...(isNotMineUnreadMessage && {
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
  socket?.emit(CHAT_EVENTS.MESSAGE_WAS_READ, { readerId: userId, messageIds });
};
```

---

### Frontend — Optimistic State Update

Before emitting to the server, the client updates its local state immediately:

```typescript
// Mark the current user's read entry as read inside each message's reads array
const updatedMessages = state.messages.map((msg) => {
  if (
    messageIdsSet.has(msg.id) &&
    msg.reads.some((r) => r.userId === userId && !r.read)
  ) {
    return {
      ...msg,
      reads: msg.reads.map((msgRead) =>
        msgRead.userId === userId ? { ...msgRead, read: true } : msgRead,
      ),
    };
  }
  return msg;
});

// Decrement unreadMessages counter per chat
const updatedChats = state.chats?.map((chat) => ({
  ...chat,
  unreadMessages: Math.max(
    chat.unreadMessages - (chatUnreadMessagesCounterMap[chat.id] ?? 0),
    0,
  ),
}));
```

---

### Socket Events

| Direction       | Event                                 | Payload                                      |
| --------------- | ------------------------------------- | -------------------------------------------- |
| Client → Server | `chat:message_was_read`               | `{ readerId: string, messageIds: string[] }` |
| Server → Client | `chat:notify_author_message_was_read` | `{ readerId: string, messageIds: string[] }` |

---

### Backend — Handler

The server listens for `chat:message_was_read`, updates the DB, then notifies each message author:

```typescript
// 1. Update read status in the DB for the reader
db.readEvents = db.readEvents.map((readEvent) => {
  if (
    messageIds.includes(readEvent.messageId) &&
    readEvent.userId === readerId
  ) {
    return { ...readEvent, read: true, updatedAt: new Date().toISOString() };
  }
  return readEvent;
});

// 2. Group messages by author and emit one event per author
for (const notification of authorNotifications) {
  socket
    .to(notification.authorSocketId)
    .emit(CHAT_EVENTS.NOTIFY_AUTHOR_MESSAGE_WAS_READ, {
      readerId,
      messageIds: notification.messageIds,
    });
}
```

---

### Frontend — Receiving Read Receipt (Author Side)

When the author receives `chat:notify_author_message_was_read`, they update the `reads` array of the relevant messages and recompute the message status:

```typescript
const onNotifyAuthorMessageWasRead = (payload: ReadReceiptPayload) => {
  const { readerId, messageIds } = payload;

  useStore.setState((state) => {
    const updatedMessages = state.messages?.map((message) => {
      if (messageIds.includes(message.id)) {
        const updatedReads = message.reads.map((msgRead) =>
          msgRead.userId === readerId ? { ...msgRead, read: true } : msgRead,
        );

        const isReadMessage = updatedReads.every((r) => r.read);

        return {
          ...message,
          reads: updatedReads,
          status: isReadMessage ? MessageStatusEnum.READ : message.status,
        };
      }
      return message;
    });

    return { messages: updatedMessages };
  });
};
```

The message status transitions to `READ` only when every participant's `read` entry is `true` — matching the Teams behaviour where the checkmark upgrades to an eye icon only after all recipients have read the message.
