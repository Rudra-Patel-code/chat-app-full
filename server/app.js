import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server as SocketIoServer } from "socket.io";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { initializeSocket } from "./socket/index.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// app.use(cors());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

const io = new SocketIoServer(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});

app.set("io", io);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ======================= Routes ==============================
import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);

// ================== Routes End =================================================

initializeSocket(io);

app.use(errorMiddleware);

export { httpServer };
