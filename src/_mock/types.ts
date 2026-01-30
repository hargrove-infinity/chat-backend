export type User = {
  id: string;
  // Id of the connected socket
  // Used for exchanging messages
  // By default null
  socketId: string | null;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // By default - false
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Chat = {
  id: string;
  type: "direct" | "group";
  // Name only for group type Chat
  name: string | null;
  // (User ids)
  participants: string[];
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
