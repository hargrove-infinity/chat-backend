import { Chat } from "./types";

export const mockedChats: Chat[] = [
  {
    id: "b52d9b55-67ee-4796-8884-8355f1a4c02c",
    type: "direct",
    name: null,
    participants: [
      "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
      "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    ],
    createdAt: "2024-01-06T10:00:00Z",
    updatedAt: "2024-01-06T10:00:00Z",
  },
  {
    id: "5a7892fe-3942-40c8-8b84-237b83cee480",
    type: "direct",
    name: null,
    participants: [
      "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
      "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    ],
    createdAt: "2024-01-07T10:00:00Z",
    updatedAt: "2024-01-07T10:00:00Z",
  },
  {
    id: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    type: "direct",
    name: null,
    participants: [
      "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
      "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    ],
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-08T10:00:00Z",
  },

  // Plans & Hangouts
  {
    id: "b41ccd75-b6cd-488c-9307-9c68108c553b",
    type: "group",
    name: "Plans & Hangouts",
    participants: [
      "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21", // James
      "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32", // Daniel
      "a4d1c2b3-1111-4eaa-9f01-123456789001", // Emma
      "b5e2d3c4-2222-4fbb-8e02-123456789002", // Olivia
    ],
    createdAt: "2024-01-11T10:00:00Z",
    updatedAt: "2024-01-11T10:00:00Z",
  },

  // Travel group
  {
    id: "9f3a7b2e-4d6c-4c8a-9c12-1e8f4a6d2b90",
    type: "group",
    name: "Travel",
    participants: [
      "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43", // Ryan
      "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54", // Christopher
      "a4d1c2b3-1111-4eaa-9f01-123456789001", // Emma
      "b5e2d3c4-2222-4fbb-8e02-123456789002", // Olivia
    ],
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
  },
];
