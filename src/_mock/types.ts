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
  SENDING = "SENDING",
  SENT = "SENT",
  ERROR = "ERROR",
}

export type MessageDTO = Message & {
  senderName: string | null;
  status: MessageStatusEnum;
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

// TODO: Remove later
/**
 * ReadEvent should be created in amount of N-participants in the current chat
 */

// TODO: Remove later
/**
 * Bob sent message to Mike
 * Bob read message (because he's sender), Mike didn't
 * Mike didn't read message
 * Mike read message
 * Mike marked message as unread
 * Mike accidentally read message
 * Mike marked message as unread again
 * Bob sent new message to Mike
 * Bob read new message (because he's sender), Mike didn't
 * Mike didn't read message yet
 * Mike has 2 unread messages
 */

export type ReadEvent = {
  id: string;
  userId: string;
  // TODO: Remove later
  /**
   * Do I really need chatId because
   * I have messageId
   * and by messageId I can find chatId
   */
  chatId: string;
  messageId: string;
  // TODO: Remove later
  /**
   * Since status field has only two options
   * maybe it's better to replace if with boolean
   * like isRead: boolean
   */
  status: "read" | "unread";
  /**
   * timestamp of ReadEvent (read status) for sender is equal to createdAt of message
   * timestamp of ReadEvent (first unread status) for interlocutor(s) is equal to createdAt of message
   */
  timestamp: string;
};
