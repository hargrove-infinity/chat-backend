export type User = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // By default - false
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

type Chat = {
  id: string;
  type: "direct" | "group";
  // Name only for group type Chat
  name: string | null;
  // (User ids)
  participants: string[];
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const mockedUsers: User[] = [
  {
    id: "7c2c8c6a-4b6d-4c1a-9c8b-4f1a5e3d2a10",
    email: "michael.thompson@mail.com",
    password: "Coffee92",
    firstName: "Michael",
    lastName: "Thompson",
    isAdmin: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    email: "james.walker@mail.com",
    password: "Sunrise24",
    firstName: "James",
    lastName: "Walker",
    isAdmin: false,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-02T10:00:00Z",
  },
  {
    id: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    email: "daniel.harris@mail.com",
    password: "BlueSky07",
    firstName: "Daniel",
    lastName: "Harris",
    isAdmin: false,
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-03T10:00:00Z",
  },
  {
    id: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    email: "ryan.mitchell@mail.com",
    password: "NightMoon15",
    firstName: "Ryan",
    lastName: "Mitchell",
    isAdmin: false,
    createdAt: "2024-01-04T10:00:00Z",
    updatedAt: "2024-01-04T10:00:00Z",
  },
  {
    id: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    email: "christopher.reynolds@mail.com",
    password: "River88",
    firstName: "Christopher",
    lastName: "Reynolds",
    isAdmin: false,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
];

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
];

export const mockedMessages: Message[] = [
  // James Walker ↔ Daniel Harris
  {
    id: "a1b2c3d4-1111-4aaa-8bbb-000000000001",
    chatId: "b52d9b55-67ee-4796-8884-8355f1a4c02c",
    senderId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    content: "Hey, did you notice the 500 error on the /metrics endpoint?",
    createdAt: "2024-01-06T10:00:10Z",
    updatedAt: "2024-01-06T10:00:10Z",
  },
  {
    id: "a1b2c3d4-1111-4aaa-8bbb-000000000002",
    chatId: "b52d9b55-67ee-4796-8884-8355f1a4c02c",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content:
      "Yeah, I saw it this morning. It happens when the token is missing.",
    createdAt: "2024-01-06T10:00:20Z",
    updatedAt: "2024-01-06T10:00:20Z",
  },
  {
    id: "a1b2c3d4-1111-4aaa-8bbb-000000000003",
    chatId: "b52d9b55-67ee-4796-8884-8355f1a4c02c",
    senderId: "c9f0b5a3-3e8a-4a2f-9d6e-8a1b2f3c4d32",
    content: "Got it. Is it a backend validation issue?",
    createdAt: "2024-01-06T10:00:30Z",
    updatedAt: "2024-01-06T10:00:30Z",
  },
  {
    id: "a1b2c3d4-1111-4aaa-8bbb-000000000004",
    chatId: "b52d9b55-67ee-4796-8884-8355f1a4c02c",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Exactly. The guard throws before the controller is reached.",
    createdAt: "2024-01-06T10:00:40Z",
    updatedAt: "2024-01-06T10:00:40Z",
  },

  // James Walker ↔ Ryan Mitchell
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000001",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    content: "Hey, do you have the latest version of the dashboard design?",
    createdAt: "2024-01-07T10:10:00Z",
    updatedAt: "2024-01-07T10:10:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000002",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Hi Ryan! Yes, I updated it yesterday.",
    createdAt: "2024-01-07T10:11:00Z",
    updatedAt: "2024-01-07T10:11:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000003",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    content: "Great. Were the mobile layouts included?",
    createdAt: "2024-01-07T10:20:00Z",
    updatedAt: "2024-01-07T10:20:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000004",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Yes, both tablet and mobile views are ready.",
    createdAt: "2024-01-07T10:30:00Z",
    updatedAt: "2024-01-07T10:30:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000005",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    content: "Nice 👍 Can you share the Figma link?",
    createdAt: "2024-01-07T10:37:00Z",
    updatedAt: "2024-01-07T10:37:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000006",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Sure, sending it now.",
    createdAt: "2024-01-07T10:43:00Z",
    updatedAt: "2024-01-07T10:43:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000007",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    content: "Thanks! I’ll review and leave comments.",
    createdAt: "2024-01-07T10:50:00Z",
    updatedAt: "2024-01-07T10:50:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000008",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Sounds good. Let me know if something needs adjustment.",
    createdAt: "2024-01-07T10:57:00Z",
    updatedAt: "2024-01-07T10:57:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000009",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b43",
    content: "Will do. Deadline is still Friday, right?",
    createdAt: "2024-01-07T11:03:00Z",
    updatedAt: "2024-01-07T11:03:00Z",
  },
  {
    id: "b2c3d4e5-2222-4bbb-9ccc-000000000010",
    chatId: "5a7892fe-3942-40c8-8b84-237b83cee480",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Yes, Friday end of day.",
    createdAt: "2024-01-07T11:10:00Z",
    updatedAt: "2024-01-07T11:10:00Z",
  },

  // James Walker ↔ Christopher Reynolds
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000001",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    content: "Hey! Did you watch the new season of Stranger Things?",
    createdAt: "2024-01-08T09:55:00Z",
    updatedAt: "2024-01-08T09:55:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000002",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Not yet! Planning to binge it this weekend.",
    createdAt: "2024-01-08T10:06:00Z",
    updatedAt: "2024-01-08T10:06:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000003",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    content: "Oh man, the first episode is insane! You’re gonna love it.",
    createdAt: "2024-01-08T10:15:00Z",
    updatedAt: "2024-01-08T10:15:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000004",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Excited! Don’t spoil anything though 😅",
    createdAt: "2024-01-08T10:20:00Z",
    updatedAt: "2024-01-08T10:20:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000005",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    content: "Promise, no spoilers. But the Upside Down scenes are next level!",
    createdAt: "2024-01-08T10:25:00Z",
    updatedAt: "2024-01-08T10:25:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000006",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Sounds awesome. I need popcorn and snacks ready.",
    createdAt: "2024-01-08T10:30:00Z",
    updatedAt: "2024-01-08T10:30:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000007",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    content: "Haha yes! Don’t forget soda. It makes it more cinematic.",
    createdAt: "2024-01-08T10:35:00Z",
    updatedAt: "2024-01-08T10:35:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000008",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Absolutely 😎. Want to do a watch-along call this weekend?",
    createdAt: "2024-01-08T10:40:00Z",
    updatedAt: "2024-01-08T10:40:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000009",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
    content: "Totally, that would be fun! Let’s set a time.",
    createdAt: "2024-01-08T10:45:00Z",
    updatedAt: "2024-01-08T10:45:00Z",
  },
  {
    id: "c3d4e5f6-3333-4ccc-addd-000000000010",
    chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
    senderId: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
    content: "Cool, I’ll text you tomorrow with the plan.",
    createdAt: "2024-01-08T10:50:00Z",
    updatedAt: "2024-01-08T10:50:00Z",
  },
];
