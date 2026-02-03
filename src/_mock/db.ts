import { mockedChats } from "./chats";
import { mockedMessages } from "./messages";
import { DB } from "./types";
import { mockedUsers } from "./users";

export const db: DB = {
  users: mockedUsers,
  chats: mockedChats,
  messages: mockedMessages,
};
