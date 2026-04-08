export type User = {
  id: string;
  /**
   * Socket ID when user is connected
   * Used for real-time message delivery and online status
   * Null when user is disconnected
   */
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
  /**
   * Group chats: stored name
   * Direct chats: null (resolved on BE to participant's name in ChatDTO)
   */
  name: string | null;
  // Array of user IDs participating in the chat
  participants: string[];
  createdAt: string;
  updatedAt: string;
};

type Participant = { id: string; name: string; isTyping: boolean };

export type ChatDTO = Omit<Chat, "participants"> & {
  /**
   * Resolved name for display
   * Group chats: stored name from Chat
   * Direct chats: participant's full name (resolved on BE)
   * Can be null if participant not found
   */
  name: string | null;

  /**
   * Content of the last message in the chat
   * Null if no messages exist
   */
  lastMessage: string | null;

  /**
   * Online status of the other participant
   * Only relevant for direct chats
   * Always false for group chats
   */
  isOnline: boolean;

  /**
   * Enhanced participant information with enriched details
   * Transforms Chat's participant IDs (string[]) into full participant objects
   * Each participant includes:
   * - id: User's unique identifier
   * - name: User's full name (firstName + lastName), null if user not found
   * - isTyping: Real-time typing indicator status for this chat
   */
  participants: Participant[];

  /**
   * Count of unread messages for the authenticated user in this chat.
   * Computed by filtering ReadEvents for this user+chat with status "unread",
   * then deduplicating by messageId (keeping the latest event per message)
   * to account for toggled read/unread states.
   * Each remaining event represents one distinct unread message.
   */
  unreadMessages: number;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export enum MessageStatusEnum {
  /** Message is being sent to server */
  SENDING = "SENDING",
  /** Message successfully delivered to server */
  SENT = "SENT",
  /** Message read by all participants in a chat */
  READ = "READ",
  /** Message failed to send */
  ERROR = "ERROR",
}

type MessageReads = { userId: string; userName: string; read: boolean };

export type MessageDTO = Message & {
  senderName: string | null;
  status: MessageStatusEnum;
  reads: MessageReads[]; // all reads of message except sender because sender already read it
};

export type Log = {
  id: string;
  socketId: string | null;
  userId: string | null;
  event: string;
  message: string | null;
  name: string | null;
  namespace: string | null;
  source: string | null;
  timestamp: string;
};

export type DB = {
  users: User[];
  chats: Chat[];
  messages: Message[];
  readEvents: ReadEvent[];
  logs: Log[];
};

export type ReadEvent = {
  userId: string;
  messageId: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
