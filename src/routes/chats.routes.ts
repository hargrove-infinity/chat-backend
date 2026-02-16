import { Router } from "express";
import { db } from "../_mock/db";
import {
  type ChatDTO,
  type MessageDTO,
  MessageStatusEnum,
  ReadEvent,
} from "../_mock/types";
import { paths } from "../common/paths";
import { authMiddleware } from "../middlewares/auth.middleware";

export const chatsRoutes = Router();

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */

/**
 * I can send chats with unreadMessages field in two ways
 * 1) add unreadMessages field to into each participant object;
 * then on the FE I check current (logged in) user id with participant id
 * extract unreadMessages field
 *
 * 2) add unreadMessages field to top level chat object because
 * in route I already got current (logged in);
 * then calculation on the FE is not needed
 *
 * Chose 2nd option
 */

const chatWithUnreadMessagesCountInEachParticipant = {
  id: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
  type: "direct",
  name: "Christopher Reynolds",
  participants: [
    {
      id: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
      name: "James Walker",
      isTyping: false,
      // New unreadMessages field
      unreadMessages: 0,
    },
    {
      id: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
      name: "Christopher Reynolds",
      isTyping: false,
      // New unreadMessages field
      unreadMessages: 3,
    },
  ],
  createdAt: "2024-01-08T10:00:00Z",
  updatedAt: "2024-01-08T10:00:00Z",
  lastMessage: "Cool, I’ll text you tomorrow with the plan.",
  isOnline: false,
};

const chatWithUnreadMessagesCountInTopLevelChat = {
  id: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
  type: "direct",
  name: "Christopher Reynolds",
  participants: [
    {
      id: "2a1e4d9f-9e5b-4b7e-8b2f-6d3c1a9f0e21",
      name: "James Walker",
      isTyping: false,
    },
    {
      id: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
      name: "Christopher Reynolds",
      isTyping: false,
    },
  ],
  createdAt: "2024-01-08T10:00:00Z",
  updatedAt: "2024-01-08T10:00:00Z",
  lastMessage: "Cool, I’ll text you tomorrow with the plan.",
  isOnline: false,
  // New unreadMessages field
  unreadMessages: 3,
};

/**
 * Steps to create unreadMessages field
 * 1) I need to filter readEvents array by userId, chatId, status: unread
 * 2) If user several times read and unread the same message there are might be
 *    multiple readEvents with same userId, chatId, messageId, and status: unread
 *    but on the FE I need only last read status message
 *    therefore I need to find the last readEvent item
 *    I need to remove duplicates in simple words
 */

chatsRoutes.get(paths.chats.list, authMiddleware, (req, res) => {
  const { user } = req;

  if (!user) {
    res.status(400).send({ errors: ["User is not attached"] });
    return;
  }

  const chats: ChatDTO[] = db.chats
    .filter((chat) => chat.participants.includes(user.id))
    .map((chat) => {
      const lastMessage = db.messages
        .filter((msg) => msg.chatId === chat.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

      const extendedParticipants = chat.participants.map((participantId) => {
        const foundUser = db.users.find((u) => u.id === participantId);

        if (!foundUser) {
          throw new Error("User is not found");
        }

        return {
          id: participantId,
          name: `${foundUser.firstName} ${foundUser.lastName}`,
          isTyping: false,
        };
      });

      // console.log("user.id:", user.id);
      // console.log("chat.id:", chat.id);

      // console.log("db.readEvents", db.readEvents);

      const unreadMessages = db.readEvents.filter(
        (readEvent) =>
          readEvent.userId === user.id &&
          readEvent.chatId === chat.id &&
          readEvent.status === "unread",
      );

      // console.log(
      //   `unreadMessages for user.id - ${user.id} and chat.id - ${chat.id}:`,
      //   unreadMessages,
      // );

      const uM: ReadEvent[] = [
        {
          id: "51c1e03d-1bf0-4b54-8755-fe2d28454270",
          userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
          chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
          messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
          status: "unread",
          timestamp: "2024-01-08T10:50:00Z",
        },
        {
          id: "d0718f26-c8d6-4569-a0ce-0819dd3fd375",
          userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
          chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
          messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
          status: "unread",
          timestamp: "2024-01-08T11:00:00Z",
        },
        {
          id: "49bc4561-7461-458b-a9c8-1039cee1e5df",
          userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
          chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
          messageId: "c3d4e5f6-3333-4ccc-addd-000000000010",
          status: "unread",
          timestamp: "2024-01-08T11:25:00Z",
        },
        {
          id: "ee6aa3c1-dc5a-451d-b493-56678b6a1861",
          userId: "8e7d6c5b-4a3f-4e2d-9c8b-1a0f2e3d4c54",
          chatId: "3425c4ce-b2c6-441d-b1bb-ea95d05bc535",
          messageId: "51c0f11e-4dc5-4596-aafa-76f48fc5c2c3",
          status: "unread",
          timestamp: "2024-01-09T08:30:00Z",
        },
      ];

      const filteredUnreadMessages = uM.reduce((acc: ReadEvent[], itm) => {
        const foundIndex = acc.findIndex(
          (el) => el.messageId === itm.messageId,
        );

        // push to acc if acc is empty or
        // acc does not contain readEvent where readEvent.messageId === itm.messageId

        if (acc.length === 0 || foundIndex === -1) {
          acc.push(itm);
        }
        // if acc DOES contain readEvent where readEvent.messageId === itm.messageId
        // push to acc newest readEvent
        else if (foundIndex > -1) {
          // @ts-ignore
          if (itm.timestamp > acc[foundIndex]?.timestamp) {
            acc[foundIndex] = itm;
          }
        }

        return acc;
      }, []);

      if (chat.type === "direct" && !chat.name) {
        const interlocutor = db.users.find(
          (u) => u.id !== user.id && chat.participants.includes(u.id),
        );

        return {
          ...chat,
          name: interlocutor
            ? `${interlocutor.firstName} ${interlocutor.lastName}`
            : null,
          lastMessage: lastMessage?.content ?? null,
          isOnline: !!interlocutor?.socketId,
          participants: extendedParticipants,
        };
      }

      console.log("filteredUnreadMessages:", filteredUnreadMessages);

      return {
        ...chat,
        lastMessage: lastMessage?.content ?? null,
        isOnline: false,
        participants: extendedParticipants,
      };
    });

  res.send({ payload: chats });
});

/**
 * Returns all messages for a specific chat
 */
chatsRoutes.get(paths.chats.messagesByChatId, authMiddleware, (req, res) => {
  const { params } = req;
  const { chatId } = params;

  const messages: MessageDTO[] = db.messages
    .filter((msg) => msg.chatId === chatId)
    .map((msg) => {
      const foundSender = db.users.find((user) => user.id === msg.senderId);

      return {
        ...msg,
        status: MessageStatusEnum.SENT,
        senderName: foundSender
          ? `${foundSender.firstName} ${foundSender.lastName}`
          : null,
      };
    });

  res.send({ payload: messages });
});
