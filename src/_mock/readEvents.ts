import type { ReadEvent } from "./types";

const danielHarrisToJamesWalkerMockedReadEvents: ReadEvent[] = [
  // Daniel Harris sent and read his message for James Walker
  {
    userId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    messageId: "2fb84f2b-2b77-4a4d-9e24-b68d803459c7",
    read: true,
    createdAt: "2024-01-10T10:50:00Z",
    updatedAt: "2024-01-10T10:50:00Z",
  },
  // James Walker has just received message from Daniel Harris (UNREAD)
  {
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    messageId: "2fb84f2b-2b77-4a4d-9e24-b68d803459c7",
    read: false,
    createdAt: "2024-01-10T10:50:00Z",
    updatedAt: "2024-01-10T10:50:00Z",
  },
];

const christopherReynoldsToJamesWalkerMockedReadEvents: ReadEvent[] = [
  // Christopher Reynolds sent and read his message for James Walker
  {
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    messageId: "d4e5f6g7-4444-4ddd-beee-000000000001",
    read: true,
    createdAt: "2024-01-09T08:10:00Z",
    updatedAt: "2024-01-09T08:10:00Z",
  },
  // James Walker has just received message from Christopher Reynolds  (UNREAD)
  {
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    messageId: "d4e5f6g7-4444-4ddd-beee-000000000001",
    read: false,
    createdAt: "2024-01-09T08:10:00Z",
    updatedAt: "2024-01-09T08:10:00Z",
  },
  // Christopher Reynolds sent and read his new message for James Walker
  {
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    messageId: "d4e5f6g7-4444-4ddd-beee-000000000002",
    read: true,
    createdAt: "2024-01-09T08:12:00Z",
    updatedAt: "2024-01-09T08:12:00Z",
  },
  // James Walker has just received new message from Christopher Reynolds  (UNREAD)
  {
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    messageId: "d4e5f6g7-4444-4ddd-beee-000000000002",
    read: false,
    createdAt: "2024-01-09T08:12:00Z",
    updatedAt: "2024-01-09T08:12:00Z",
  },
];

const plansAndHangoutsMockedReadEvents: ReadEvent[] = [
  // Olivia Brown sent and read her message
  {
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    read: true,
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-12T08:15:00Z",
  },

  // Emma Wilson has just received message from Olivia Brown at 2024-01-12T08:15:00Z (UNREAD)
  // Emma Wilson read message from Olivia Brown at 2024-01-12T08:16:41Z (READ)
  {
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    read: true,
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-12T08:16:41Z",
  },

  // James Walker has just received message from Olivia Brown (UNREAD)
  {
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    read: false,
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-12T08:15:00Z",
  },

  // Daniel Harris has just received message from Olivia Brown at 2024-01-12T08:15:00Z (UNREAD)
  // Daniel Harris read message from Olivia Brown at 2024-01-12T08:17:05Z (READ)
  {
    userId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    messageId: "b9956344-fb45-4147-b0a3-f4a649452ca5",
    read: true,
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-12T08:17:05Z",
  },

  // Daniel Harris sent and read his message
  {
    userId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    read: true,
    createdAt: "2024-01-12T08:20:00Z",
    updatedAt: "2024-01-12T08:20:00Z",
  },

  // Emma Wilson has just received message from Daniel Harris at 2024-01-12T08:20:00Z (UNREAD)
  // Emma Wilson read message from Daniel Harris at 2024-01-12T08:20:33Z (READ)
  {
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    read: true,
    createdAt: "2024-01-12T08:20:00Z",
    updatedAt: "2024-01-12T08:20:33Z",
  },

  // James Walker has just received message from Daniel Harris (UNREAD)
  {
    userId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    read: false,
    createdAt: "2024-01-12T08:20:00Z",
    updatedAt: "2024-01-12T08:20:00Z",
  },

  // Olivia Brown has just received message from Daniel Harris at 2024-01-12T08:20:00Z (UNREAD)
  // Olivia Brown read message from Daniel Harris at 2024-01-12T08:20:45Z (READ)
  {
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    messageId: "38fdc2c6-f006-4a0f-8b1b-a425c4774af8",
    read: true,
    createdAt: "2024-01-12T08:20:00Z",
    updatedAt: "2024-01-12T08:20:45Z",
  },
];

const travelGroupMockedReadEvents: ReadEvent[] = [
  // Emma Wilson sent and read her message
  {
    userId: "a4d1c2b3-1111-4eaa-9f01-123456789001",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    read: true,
    createdAt: "2024-01-23T09:30:00Z",
    updatedAt: "2024-01-23T09:30:00Z",
  },

  // Olivia Brown has just received message from Emma Wilson at 2024-01-23T09:30:00Z (UNREAD)
  // Olivia Brown read message from Emma Wilson at 2024-01-23T09:30:15Z (READ)
  {
    userId: "b5e2d3c4-2222-4fbb-8e02-123456789002",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    read: true,
    createdAt: "2024-01-23T09:30:00Z",
    updatedAt: "2024-01-23T09:30:15Z",
  },

  // Ryan Mitchell has just received message from Emma Wilson (UNREAD)
  {
    userId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    read: false,
    createdAt: "2024-01-23T09:30:00Z",
    updatedAt: "2024-01-23T09:30:00Z",
  },

  // Christopher Reynolds has just received message from Emma Wilson (UNREAD)
  {
    userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    messageId: "3b7e1f9a-6d4c-4a2e-8f5b-1c9d2e4a7b05",
    read: false,
    createdAt: "2024-01-23T09:30:00Z",
    updatedAt: "2024-01-23T09:30:00Z",
  },
];

export const mockedReadEvents: ReadEvent[] = [
  /**
   * Daniel Harris ↔ James Walker
   * James Walker has 1 unread message
   */
  ...danielHarrisToJamesWalkerMockedReadEvents,

  /**
   * Christopher Reynolds ↔ James Walker
   * James Walker has 2 unread messages
   */
  ...christopherReynoldsToJamesWalkerMockedReadEvents,

  /**
   * Plans & Hangouts
   * James Walker has 2 unread messages
   */
  ...plansAndHangoutsMockedReadEvents,

  /**
   * Travel group
   * Ryan Mitchell has 1 unread message
   * Christopher Reynolds has 1 unread message
   */
  ...travelGroupMockedReadEvents,
];
