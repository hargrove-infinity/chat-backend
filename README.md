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

`ReadEvent` is a record that tracks the read/unread state of a specific message for a specific user, scoped to a specific chat via `chatId`. Every time a message is sent or its read state changes, a new `ReadEvent` entry is created — events are **never mutated**, only appended, preserving the full history of read/unread state changes per message.

---

### Creation Rules

When a message is sent, `N` ReadEvents are created — one per chat participant:

- **Sender** gets a `ReadEvent` with `status: "read"` (they authored it)
- **Every other participant** gets a `ReadEvent` with `status: "unread"`

The `timestamp` of these initial events equals the message's `createdAt`.

---

### Event Lifecycle (direct chat example)

| Action                        | New ReadEvent                                                           |
| ----------------------------- | ----------------------------------------------------------------------- |
| Bob sends a message           | `{ userId: Bob, status: "read" }`, `{ userId: Mike, status: "unread" }` |
| Mike reads the message        | `{ userId: Mike, status: "read" }`                                      |
| Mike marks it as unread       | `{ userId: Mike, status: "unread" }`                                    |
| Mike accidentally reads it    | `{ userId: Mike, status: "read" }`                                      |
| Mike marks it as unread again | `{ userId: Mike, status: "unread" }`                                    |

The same message can accumulate **multiple ReadEvents** for the same user. The frontend only uses the most recent one to determine the current read state, while the full history remains available for purposes such as admin tooling, analytics, or audit trails.

---

### Computing `unreadMessages` on the API

The `unreadMessages` count on `ChatDTO` is computed in three steps inside `GET /chats`:

**Step 1 — Filter** `db.readEvents` down to events relevant to the current user and chat with `status: "unread"`:

```typescript
db.readEvents.filter(
  (e) => e.userId === user.id && e.chatId === chat.id && e.status === "unread",
);
```

**Step 2 — Deduplicate** by `messageId`, keeping only the most recent event per message (since the same message may have been toggled multiple times):

```typescript
unreadEvents.reduce((acc, currentEvent) => {
  const existingIndex = acc.findIndex(
    (e) => e.messageId === currentEvent.messageId,
  );
  if (existingIndex === -1) {
    acc.push(currentEvent);
  } else if (currentEvent.timestamp > acc[existingIndex].timestamp) {
    acc[existingIndex] = currentEvent;
  }
  return acc;
}, []);
```

**Step 3 — Count**: `filteredUnreadEvents.length` → this is the `unreadMessages` value.

---

### Placement on `ChatDTO`

There were two design options considered:

| Option          | Description                                                                                   | Chosen |
| --------------- | --------------------------------------------------------------------------------------------- | ------ |
| Per-participant | `unreadMessages` nested inside each participant object; FE filters by current user ID         | ✗      |
| Top-level       | `unreadMessages` at the root of `ChatDTO`; already scoped to the authenticated user on the BE | ✓      |

The top-level approach was chosen because the backend already has the authenticated user in context, so the frontend receives a pre-scoped count with no extra computation needed.

---

### Concrete Example

Given these ReadEvents for **Christopher Reynolds** in chat `3425c4ce-...`:

| messageId (short) | status | timestamp        | action                                              |
| ----------------- | ------ | ---------------- | --------------------------------------------------- |
| `c3d4e5f6-...`    | unread | 10:50            | Christopher Reynolds has just received message      |
| `c3d4e5f6-...`    | read   | 10:53            | Christopher Reynolds read message                   |
| `c3d4e5f6-...`    | unread | 11:00            | Christopher Reynolds marked message as unread       |
| `c3d4e5f6-...`    | read   | 11:23            | Christopher Reynolds accidentally read message      |
| `c3d4e5f6-...`    | unread | 11:25 ← latest   | Christopher Reynolds marked message as unread again |
| `51c0f11e-...`    | unread | 12:18 ← only one | Christopher Reynolds has just received new message  |

After filtering `status: "unread"` and deduplicating by `messageId`:

- `c3d4e5f6-...` → keeps the `11:25` event
- `51c0f11e-...` → keeps the `12:18` event

**Result: `unreadMessages = 2`**
