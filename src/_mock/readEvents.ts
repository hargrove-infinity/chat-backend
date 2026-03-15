import type { ReadEvent } from "./types";

export const mockedReadEvents: ReadEvent[] = [
  /* James Walker ↔ Christopher Reynolds */

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

  /* James Walker ↔ Daniel Harris */

  // Daniel Harris sent and read his message for James Walker
  {
    id: "db1412da-6902-4457-a7d4-c090b11a2d66",
    userId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    chatId: "b52d9b55-67ee-4796-8884-8355f1a4c02c",
    messageId: "2fb84f2b-2b77-4a4d-9e24-b68d803459c7",
    status: "read",
    timestamp: "2024-01-10T10:50:00Z",
  },
  // James Walker has just received message from Daniel Harris (UNREAD)
  {
    id: "4e43759d-738e-485c-baec-b326205daf6e",
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    chatId: "b52d9b55-67ee-4796-8884-8355f1a4c02c",
    messageId: "2fb84f2b-2b77-4a4d-9e24-b68d803459c7",
    status: "unread",
    timestamp: "2024-01-10T10:50:00Z",
  },

  /* James Walker ↔ Ryan Mitchell */

  // Ryan Mitchell sent and read his message for James Walker
  {
    id: "abc8bbad-3cf7-4160-8fa5-dd716c80341b",
    userId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    messageId: "b2c3d4e5-2222-4bbb-9ccc-000000000011",
    status: "read",
    timestamp: "2024-01-08T09:05:00Z",
  },

  // James Walker has just received message from Ryan Mitchell  (UNREAD)
  {
    id: "0307ca6c-35b1-4f12-b4c4-411c1e789b3f",
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    messageId: "b2c3d4e5-2222-4bbb-9ccc-000000000011",
    status: "unread",
    timestamp: "2024-01-08T09:05:00Z",
  },

  // Ryan Mitchell sent and read his new message for James Walker
  {
    id: "41298e00-6f62-42d0-b96f-42719619d467",
    userId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    messageId: "b2c3d4e5-2222-4bbb-9ccc-000000000012",
    status: "read",
    timestamp: "2024-01-08T09:06:00Z",
  },

  // James Walker has just received new message from Ryan Mitchell  (UNREAD)
  {
    id: "ac733930-3341-4e6c-a557-18673dca904a",
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    messageId: "b2c3d4e5-2222-4bbb-9ccc-000000000012",
    status: "unread",
    timestamp: "2024-01-08T09:06:00Z",
  },

  /* Plans & Hangouts */

  // Olivia Brown sent and read her message
  {
    id: "fbebfc56-f46b-4b31-aeea-c99bc045125d",
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    status: "read",
    timestamp: "2024-01-12T08:15:00Z",
  },

  // Emma Wilson has just received message from Olivia Brown (UNREAD)
  {
    id: "11fc32c0-c91c-45ec-8dd9-20cb386bfcc6",
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    status: "unread",
    timestamp: "2024-01-12T08:15:00Z",
  },

  // James Walker has just received message from Olivia Brown (UNREAD)
  {
    id: "6a1fba34-8d50-4dc3-b7a2-fa79de5d8030",
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    status: "unread",
    timestamp: "2024-01-12T08:15:00Z",
  },

  // Daniel Harris has just received message from Olivia Brown (UNREAD)
  {
    id: "dfd2f434-91c9-4290-a558-c37583eb3e96",
    userId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    status: "unread",
    timestamp: "2024-01-12T08:15:00Z",
  },

  // Emma Wilson read message from Olivia Brown (READ)
  {
    id: "94f270ff-027c-4142-93c0-55cc046335a2",
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    status: "read",
    timestamp: "2024-01-12T08:15:42Z",
  },

  // Daniel Harris read message from Olivia Brown (READ)
  {
    id: "ec064520-0d5c-4744-94ec-444c78e99db9",
    userId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    status: "read",
    timestamp: "2024-01-12T08:16:01Z",
  },

  // Daniel Harris sent and read his message
  {
    id: "45751fbc-2582-4749-9fc7-beea6ea13f74",
    userId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    status: "read",
    timestamp: "2024-01-12T08:20:00Z",
  },

  // Emma Wilson has just received message from Daniel Harris (UNREAD)
  {
    id: "366c55ef-afc5-4238-8864-912800e35ffa",
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    status: "unread",
    timestamp: "2024-01-12T08:20:00Z",
  },

  // James Walker has just received message from Daniel Harris (UNREAD)
  {
    id: "a18898e3-88a3-4d77-925b-908137461618",
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    status: "unread",
    timestamp: "2024-01-12T08:20:00Z",
  },

  // Olivia Brown has just received message from Daniel Harris (UNREAD)
  {
    id: "13d41a17-898b-4c88-b2ac-6f7f4937be2e",
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    status: "unread",
    timestamp: "2024-01-12T08:20:00Z",
  },

  // Emma Wilson read message from Daniel Harris (READ)
  {
    id: "928bd10c-f361-4e4e-97c5-704024fa8321",
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    status: "read",
    timestamp: "2024-01-12T08:20:05Z",
  },

  // Olivia Brown read message from Daniel Harris (READ)
  {
    id: "521327e1-3e12-47d2-9afd-679ee85ecf0d",
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    chatId: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    status: "read",
    timestamp: "2024-01-12T08:20:10Z",
  },

  /* Travel group */

  // Emma Wilson sent and read her message
  {
    id: "727850c5-0b85-4b78-a029-bee5b49e25f2",
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    chatId: "9f3a7b2e-4d6c-4c8a-9c12-1e8f4a6d2b90",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    status: "read",
    timestamp: "2024-01-23T09:30:00Z",
  },

  // Olivia Brown has just received message from Emma Wilson (UNREAD)
  {
    id: "25ce0857-d638-4ebd-89f4-8b5e538504db",
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    chatId: "9f3a7b2e-4d6c-4c8a-9c12-1e8f4a6d2b90",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    status: "unread",
    timestamp: "2024-01-23T09:30:00Z",
  },

  // Ryan Mitchell has just received message from Emma Wilson (UNREAD)
  {
    id: "b0651128-6877-420c-b150-4598e6d86cd8",
    userId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    chatId: "9f3a7b2e-4d6c-4c8a-9c12-1e8f4a6d2b90",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    status: "unread",
    timestamp: "2024-01-23T09:30:00Z",
  },

  // Christopher Reynolds has just received message from Emma Wilson (UNREAD)
  {
    id: "53fa0f65-fef0-4fec-8e89-fdb28578783e",
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    chatId: "9f3a7b2e-4d6c-4c8a-9c12-1e8f4a6d2b90",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    status: "unread",
    timestamp: "2024-01-23T09:30:00Z",
  },

  // Olivia Brown read message from Emma Wilson (READ)
  {
    id: "17a0bf28-8d5a-47c3-b411-91d9d8a9f43c",
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    chatId: "9f3a7b2e-4d6c-4c8a-9c12-1e8f4a6d2b90",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    status: "read",
    timestamp: "2024-01-23T09:30:051Z",
  },
];
