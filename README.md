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

> Note: deduplication is no longer needed since each participant has exactly one `ReadEvent` per message.

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

**Result: `unreadMessages = 2`** for James Walker in this chat.

---

#### Group chat — Plans & Hangouts

Two messages were sent — one by Olivia Brown, one by Daniel Harris. James Walker hasn't read either:

| messageId (short) | userId (short) | user          | read  | createdAt | updatedAt | action                                                                    |
| ----------------- | -------------- | ------------- | ----- | --------- | --------- | ------------------------------------------------------------------------- |
| `b9956344-...`    | `b5e2d3c4-...` | Olivia Brown  | true  | 08:15     | 08:15     | Olivia Brown sent and read her message                                    |
| `b9956344-...`    | `a4d1c2b3-...` | Emma Wilson   | true  | 08:15     | 08:16     | Emma Wilson has just received message from Olivia Brown and the read it   |
| `b9956344-...`    | `2a1e4d9f-...` | James Walker  | false | 08:15     | 08:15     | James Walker has just received message from Olivia Brown (UNREAD)         |
| `b9956344-...`    | `c9f0b5a3-...` | Daniel Harris | true  | 08:15     | 08:17     | Daniel Harris has just received message from Olivia Brown and the read it |
| `38fdc2c6-...`    | `c9f0b5a3-...` | Daniel Harris | true  | 08:20     | 08:20     | Daniel Harris sent and read his message                                   |
| `38fdc2c6-...`    | `a4d1c2b3-...` | Emma Wilson   | true  | 08:20     | 08:20     | Emma Wilson has just received message from Daniel Harris and the read it  |
| `38fdc2c6-...`    | `2a1e4d9f-...` | James Walker  | false | 08:20     | 08:20     | James Walker has just received message from Daniel Harris (UNREAD)        |
| `38fdc2c6-...`    | `b5e2d3c4-...` | Olivia Brown  | true  | 08:20     | 08:20     | Olivia Brown has just received message from Daniel Harris and the read it |

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

**Result: `unreadMessages = 1`** for Ryan Mitchell in this chat.

**Result: `unreadMessages = 1`** for Christopher Reynolds in this chat.
