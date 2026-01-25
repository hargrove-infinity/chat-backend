import { createServer } from "node:http";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Server } from "socket.io";

import { envVariables } from "./common";
import { mockedChats, mockedMessages, mockedUsers, User } from "./_mock";

/**
 * Initialize Express application, enable CORS for cross-origin requests,
 * and parse incoming JSON request bodies
 */
const app = express();
app.use(cors());
app.use(express.json());

/**
 * Middleware that validates the auth token from request headers,
 * decodes user data, and attaches the authenticated user to req.user
 */
async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(400).send({ errors: ["Auth token is missing"] });
    return;
  }

  const decoded: Omit<User, "password"> = JSON.parse(atob(authorization));

  req.user = decoded;

  next();
}

/**
 * Authenticates user credentials against mocked data,
 * and returns a base64-encoded user payload on successful login
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const foundUser = mockedUsers.find(
    (user) => user.email === email && user.password === password,
  );

  if (foundUser) {
    const { password, ...restUserData } = foundUser;
    const encoded = Buffer.from(JSON.stringify(restUserData)).toString(
      "base64",
    );

    res.send({ payload: encoded });
    return;
  }

  res.status(400).send({ errors: ["Wrong credentials"] });
});

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */
app.get("/chats", authMiddleware, async (req: Request, res) => {
  const { user } = req;

  if (user) {
    const chats = mockedChats
      .filter((chat) => chat.participants.includes(user.id))
      .map((chat) => {
        const lastMessage = mockedMessages
          .filter((msg) => msg.chatId === chat.id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0];

        if (chat.type === "direct" && !chat.name) {
          const interlocutorId = chat.participants.find(
            (userId) => userId !== user.id,
          );

          const foundUser = mockedUsers.find(
            (user) => user.id === interlocutorId,
          );

          return {
            ...chat,
            lastMessage: lastMessage?.content,
            name: `${foundUser?.firstName} ${foundUser?.lastName}`,
          };
        }

        return {
          ...chat,
          lastMessage: lastMessage?.content,
        };
      });

    res.send({ payload: chats });
    return;
  }

  res.status(400).send({ errors: ["User is not attached"] });
});

/**
 * Returns all messages for a specific chat,
 * marking each message as owned by the current user when applicable
 */
app.get("/chats/:chatId/messages", authMiddleware, (req: Request, res) => {
  const { params, user } = req;
  const { chatId } = params;
  if (user) {
    const messages = mockedMessages
      .filter((msg) => msg.chatId === chatId)
      .map((msg) => ({ ...msg, isMine: msg.senderId === user.id }));

    res.send({ payload: messages });
    return;
  }

  res.status(400).send({ errors: ["User is not attached"] });
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: envVariables.frontendUrl,
    methods: ["GET", "POST"],
  },
});

const chatNamespace = io.of("/chat");

const adminNamespace = io.of("/admin");

chatNamespace.use((socket, next) => {
  if (!socket.handshake.auth.token) {
    console.log("User without token has been rejected");
    return next(new Error("Missing token"));
  }

  console.log("User with token has been accepted");
  next();
});

adminNamespace.use((socket, next) => {
  if (!socket.handshake.auth.isAdmin) {
    console.log("Non admin has been rejected");
    return next(new Error("Missing admin role"));
  }

  if (!socket.handshake.auth.token) {
    console.log("Admin without token has been rejected");
    return next(new Error("Missing admin token"));
  }

  console.log("Admin with token has been accepted");
  next();
});

adminNamespace.on("connection", (socket) => {
  console.log("an admin user connected");

  socket.on("disconnecting", (reason) => {
    console.log("Reason of a disconnecting admin:", reason);
  });

  socket.on("disconnect", (reason) => {
    console.log("Reason of a disconnect admin:", reason);
  });

  // TODO: add disconnection later
  // Disconnect for socket
  // setTimeout(() => {
  //   // true closes the underlying connection
  //   socket.disconnect(true);
  // }, 2000);

  socket.emit("chat message", "Hello from the Backend admin namespace");
});

chatNamespace.on("connection", (socket) => {
  console.log("a chat user connected");

  socket.on("chat message", (msg) => {
    // TODO: Here message is being received from the frontend
    // TODO: stored in database (temporarily in mockedMessages)
    // TODO: sent back to the frontend socket.emit("chat message", message)
    console.log(`message: ${msg}`);
  });

  socket.on("disconnecting", (reason) => {
    console.log("Reason of a disconnecting chat:", reason);
  });

  socket.on("disconnect", (reason) => {
    console.log("Reason of a disconnect chat:", reason);
  });

  // TODO: add disconnection later
  // Disconnect for socket
  // setTimeout(() => {
  //   // true closes the underlying connection
  //   socket.disconnect(true);
  // }, 2000);

  socket.emit("chat message", "Hello from the Backend chat namespace");

  // TODO: apply this later
  // if (chatNamespace.sockets.size > 1) {
  //   chatNamespace.disconnectSockets();
  // }
});

setInterval(() => {
  adminNamespace.emit("metrics", { userCount: chatNamespace.sockets.size });
}, 3000);

server.listen(envVariables.port, () => {
  console.log("Server is running");
});
