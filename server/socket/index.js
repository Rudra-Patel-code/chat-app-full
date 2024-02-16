import cookie from "cookie";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { AvailableEvents, EventEnums } from "../constants.js";
import { ApiError } from "../helpers/ApiError.js";

export const initializeSocket = (io) => {
  io.on("connection", async (socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

      let token = cookies?.accessToken;

      if (!token) {
        token = socket.handshake.auth?.token;
      }

      if (!token) {
        throw new ApiError(400, "Not Authorized. Token is missing");
      }

      const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(_id).select(
        "-password -utitlityToken -utitlityTokenExpiry"
      );

      if (!user) {
        throw new ApiError(400, "Not Authorized. Token is invalid");
      }

      socket.user = user;

      //? user first connecte to socket
      socket.join(user?._id.toString());
      socket.emit(EventEnums.CONNECTED);
      console.log(`User connected - - User ID: ${user?._id.toString()}`);

      //?   when user joined a chat
      socket.on(EventEnums.JOINED_CHAT, (data) => {
        console.log(`User joined the chat. chatId: ${data.chatId}`);
        socket.join(data.chatId);
      });

      //?   when user starts typing
      socket.on(EventEnums.TYPING, (data) => {
        console.log(`Typing in chat: ${data.chatId}`);
        socket.in(data.chatId).emit(EventEnums.TYPING, { chatId: data.chatId });
      });

      //?   when user stops typing
      socket.on(EventEnums.STOP_TYPING, (data) => {
        console.log(`Stopped typing in chat: ${data.chatId}`);

        socket
          .in(data.chatId)
          .emit(EventEnums.STOP_TYPING, { chatId: data.chatId });
      });

      //?   when user disconnectes
      socket.on(EventEnums.DISCONNECTED, () => {
        console.log(
          `User Disconnected - - User ID: ${socket.user?._id.toString()}`
        );

        if (socket.user._id) {
          socket.leave(socket.user._id);
        }
      });
    } catch (error) {
      socket.emit(EventEnums.SOCKET_ERROR, {
        message:
          error?.message || "Something went wrong while connecting to socket",
      });
    }
  });
};

export const emitSocketEvent = (req, roomId, payload, event) => {
  console.log("room id:" + roomId);
  console.log("event emitted");
  req.app.get("io").in(roomId).emit(event, payload);
};
