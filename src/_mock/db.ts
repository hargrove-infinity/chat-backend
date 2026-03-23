import { mockedChats } from "./chats";
import { mockedMessages } from "./messages";
import { mockedReadEvents } from "./readEvents";
import type { DB } from "./types";
import { mockedUsers } from "./users";

export const db: DB = {
  users: mockedUsers,
  chats: mockedChats,
  messages: mockedMessages,
  readEvents: mockedReadEvents,
  logs: [],
};
