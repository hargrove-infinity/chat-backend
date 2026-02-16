import type { ReadEvent } from "./types";

export const mockedReadEvents: ReadEvent[] = [
  // James Walker sent and read his message for Christopher Reynolds
  {
    id: "9e7358e9-d92f-4284-a703-3d1e02d73656",
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
    status: "read",
    timestamp: "2024-01-08T10:50:00Z",
  },
  // Christopher Reynolds has just received message from James Walker (UNREAD)
  {
    id: "51c1e03d-1bf0-4b54-8755-fe2d28454270",
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
    status: "unread",
    timestamp: "2024-01-08T10:50:00Z",
  },
  // Christopher Reynolds read message from James Walker (READ)
  {
    id: "3aa51bf6-0c5c-4d2d-9145-deb824541db6",
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
    status: "read",
    timestamp: "2024-01-08T10:53:00Z",
  },
  // Christopher Reynolds marked message from James Walker as unread (UNREAD)
  {
    id: "d0718f26-c8d6-4569-a0ce-0819dd3fd375",
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
    status: "unread",
    timestamp: "2024-01-08T11:00:00Z",
  },
  // Christopher Reynolds accidentally read message from James Walker (READ)
  {
    id: "8e00f3a6-e88f-463a-a36c-4591ccd2c2bf",
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
    status: "read",
    timestamp: "2024-01-08T11:23:00Z",
  },
  // Christopher Reynolds marked message from James Walker as unread again (UNREAD)
  {
    id: "49bc4561-7461-458b-a9c8-1039cee1e5df",
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
    status: "unread",
    timestamp: "2024-01-08T11:25:00Z",
  },
  // James Walker sent and read his new message for Christopher Reynolds
  {
    id: "34180a94-6520-4b34-b810-faf05bc641e1",
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "51c0f11e-4dc5-4596-aafa-76f48fc5c2c3",
    status: "read",
    timestamp: "2024-01-09T08:30:00Z",
  },
  // Christopher Reynolds has just received new message from James Walker (UNREAD)
  {
    id: "ee6aa3c1-dc5a-451d-b493-56678b6a1861",
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    messageId: "51c0f11e-4dc5-4596-aafa-76f48fc5c2c3",
    status: "unread",
    timestamp: "2024-01-09T08:30:00Z",
  },
];
