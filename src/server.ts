import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { envVariables } from "./common";

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: envVariables.frontendUrl,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chat message", (msg) => {
    console.log(`message: ${msg}`);
  });

  socket.emit("chat message", "Hello from the Backend");
});

server.listen(envVariables.port, () => {
  console.log("Server is running");
});
