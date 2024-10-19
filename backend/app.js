import express from "express";
import cors from "cors";
import { userRouter } from "./src/routers/User.router.js";
import multer from "multer";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { messageRouter } from "./src/routers/Message.router.js";
import axios from "axios";

const app = express();
const corsOptions = {
  origin: "http://192.168.18.8:8081",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload = path.join(__dirname, "src", "public", "uploads");
app.use("/profilepic", express.static(upload));
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://192.168.18.8:8081",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  console.log(`A user connected: ${socket.id}`);
  const token = socket.handshake.query.token;
  const userID = socket.handshake.query.userId;

  if (!token) {
    console.log("No token received!");
    return;
  }

  try {
    const res = await axios.get(
      `http://192.168.18.8:3000/api/message/get/${userID}`,
      {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      }
    );

    socket.emit("load-messages", res.data.messageArray || []); // Emit the fetched messages or an empty array
  } catch (error) {
    socket.emit("load-messages", []); // Emit an empty array if there's an error
  }

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

export { app, server };
