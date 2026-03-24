import { mockedChats } from "./chats";
import type { DB } from "./types";
import { mockedUsers } from "./users";

export const db: DB = {
  users: mockedUsers,
  chats: mockedChats,
  messages: [],
  readEvents: [],
  logs: [],
};
