import express from "express";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { JWT_SECRET } from "../secrets";

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

io.use((socket, next) => {
  const token = socket.handshake.query?.token as string | undefined;
  if (!token) return next(new Error("Authentication error"));
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as any;
    // attach userId to socket for future
    (socket as any).userId = payload.id;
    return next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket as any).userId;
  if (userId) {
    // join room named by userId
    socket.join(userId);
  }

  socket.on("disconnect", () => {
    // cleanup if needed
  });
});
