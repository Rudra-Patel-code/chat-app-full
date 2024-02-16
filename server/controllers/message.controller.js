import mongoose from "mongoose";
import { ApiError } from "../helpers/ApiError.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { emitSocketEvent } from "../socket/index.js";
import { v2 } from "cloudinary";
import { EventEnums } from "../constants.js";

const messageAggregator = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sender",
        as: "sender",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        sender: { $first: "$sender" },
      },
    },
  ];
};

const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  console.log(chatId);

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exists");
  }

  if (!selectedChat.participants?.includes(req.user?._id))
    throw new ApiError(404, "User is not a part of this chat");

  const messages = await Message.aggregate([
    {
      $match: {
        partof: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...messageAggregator(),
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res.status(200).json({
    ...new ApiResponse(200, messages || [], "Messages fetched successfully"),
  });
});

const createMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  const files = req.files;

  if (!content && !files.length > 0)
    throw new ApiError(400, "message content or image id required");

  const chat = await Chat.findById(chatId);

  if (!chat) throw new ApiError(404, "Chat not found");

  let attachments = [];

  if (files.length > 0) {
    attachments = [
      ...files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })),
    ];
  }

  const message = await Message.create({
    sender: new mongoose.Types.ObjectId(req.user._id),
    content: content || "",
    partof: new mongoose.Types.ObjectId(chatId),
    attachments,
  });

  const _chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        lastMessage: message._id,
      },
    },
    { new: true }
  );

  const aggregatedMessage = await Message.aggregate([
    {
      $match: {
        _id: message._id,
      },
    },
    ...messageAggregator(),
  ]);

  const receivedMessage = aggregatedMessage[0];

  if (!receivedMessage) {
    throw new ApiError(500, "Internal server error");
  }

  _chat.participants.forEach((participantId) => {
    if (participantId.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participantId.toString(),
      { receivedMessage },
      EventEnums.MESSAGE_RECEIVED
    );
  });

  return res.status(201).json({
    ...new ApiResponse(201, receivedMessage, "Message recieved Successfully"),
  });
});

export { createMessage, getChatMessages };
