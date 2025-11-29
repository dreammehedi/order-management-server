import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { JWT_SECRET } from "../secrets";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    console.log(token, "token");

    if (!token) return next(new Error("No auth token"));

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET as string);

      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      console.log(err, "err");
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.data.userId);

    // Join room = userId
    socket.join(socket.data.userId);

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.data.userId);
    });
  });

  return io;
}

export { io };
