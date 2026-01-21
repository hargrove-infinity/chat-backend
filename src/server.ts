import { createServer } from "node:http";

import express from "express";
import cors from "cors";
import { Server } from "socket.io";

import { envVariables } from "./common";
import { mockedUsers } from "./_mock";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const foundUser = mockedUsers.find(
    (user) => user.email === email && user.password === password,
  );

  if (foundUser) {
    res.send({ payload: foundUser.token });
    return;
  }

  res.status(400).send({ errors: ["Wrong credentials"] });
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
