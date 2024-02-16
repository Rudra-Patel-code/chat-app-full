import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { v2 } from "cloudinary";
import { emitSocketEvent } from "../socket/index.js";
import { EventEnums } from "../constants.js";
import mongoose from "mongoose";

const chatAggregator = () => {
  return [
    {
      // lookup for the participants present
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "participants",
        as: "participants",
        pipeline: [
          {
            $project: {
              password: 0,
              utitlityToken: 0,
              utitlityTokenExpiry: 0,
            },
          },
        ],
      },
    },
    {
      // lookup for the group chats
      $lookup: {
        from: "messages",
        foreignField: "_id",
        localField: "lastMessage",
        as: "lastMessage",
        pipeline: [
          {
            // get details of the sender
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "sender",
              as: "sender",
              pipeline: [
                {
                  $project: {
                    password: 0,
                    utitlityToken: 0,
                    utitlityTokenExpiry: 0,
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
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};

const removeDeletedCloudinaryMedia = async (chatId) => {
  const messages = await Message.find({ partof: chatId });

  let publicIds = [];

  messages.forEach((message) => {
    publicIds = publicIds.concat(...message.attachments);
  });

  publicIds.forEach(async (attachment) => {
    await v2.uploader.destroy(attachment.public_id);
  });

  await Message.deleteMany({
    partof: chatId,
  });
};

const createOrFetchOneOnOneChat = asyncHandler(async (req, res) => {
  const { participantId } = req.params;

  const participant = await User.findById(participantId);

  if (!participant) throw new ApiError(404, "Reciever not found");

  if (participant._id.toString() === req.user._id.toString())
    throw new ApiError(400, "You Cannot Chat with Yourself");

  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false,

        $and: [
          {
            participants: { $elemMatch: { $eq: req.user._id } },
          },
          {
            participants: { $elemMatch: { $eq: participant._id } },
          },
        ],
      },
    },

    ...chatAggregator(),
  ]);

  // if that already exists
  if (chat.length > 0) {
    return res.status(200).json({
      ...new ApiResponse(200, chat[0], "Chat retrieved successfully"),
    });
  }

  const newChat = await Chat.create({
    name: participant.username,
    participants: [req.user._id, participant._id],
    admin: req.user._id,
  });

  const aggregatedChat = await Chat.aggregate([
    {
      $match: {
        _id: newChat._id,
      },
    },
    ...chatAggregator(),
  ]);

  const payload = aggregatedChat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  console.log("going to emit event");

  emitSocketEvent(
    req,
    participant._id.toString(),
    { payload },
    EventEnums.NEW_CHAT
  );

  return res.status(201).json({
    ...new ApiResponse(201, payload, "Char created successfully"),
  });
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  if (participants.includes(req.user._id.toString()))
    throw new ApiError(400, "Participants should not include group creator");

  // removing any duplicates
  let members = [...new Set([...participants, req.user._id.toString()])];

  // atleast 2 members should be there other than the current user
  if (members.length < 3)
    throw new ApiError(400, "At least 2 memebers should be added");

  //! we do not need to check for the group with same / exact these participants as there can be same participants

  const newChat = await Chat.create({
    name,
    isGroupChat: true,
    participants: members,
    admin: req.user._id,
  });

  const aggregatedChat = await Chat.aggregate([
    {
      $match: {
        _id: newChat._id,
      },
    },
    ...chatAggregator(),
  ]);

  const payload = aggregatedChat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload.participants.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id.toString(),
      { payload },
      EventEnums.NEW_CHAT
    );
  });

  return res.status(200).json({
    ...new ApiResponse(200, payload, "Group Chat created successfully"),
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: req.user._id },
      },
    },
    {
      $project: {
        password: 0,
        utitlityToken: 0,
        utitlityTokenExpiry: 0,
      },
    },
  ]);

  res.status(200).json({
    ...new ApiResponse(200, users, "Users fetched successfully"),
  });
});

const getGroupDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatAggregator(),
  ]);

  const payload = groupChat[0];

  if (!payload) throw new ApiError("Group Chat Not found");

  return res.status(200).json({
    ...new ApiResponse(200, payload, "Chat fetched Successfully"),
  });
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;

  const chat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!chat) throw new ApiError(404, "Chat not found");

  if (chat.admin.toString() !== req.user._id.toString())
    throw new ApiError(400, "You are not an Administrator");

  chat.name = name;

  await chat.save();

  const updatedChat = await Chat.aggregate([
    {
      $match: {
        _id: chat._id,
        isGroupChat: true,
      },
    },
    ...chatAggregator(),
  ]);

  const payload = updatedChat[0];

  if (!payload) throw new ApiError(500, "Internal server error");

  payload.participants?.forEach((participant) => {
    // if (participant._id.toString() === req.user._id.toString()) return;
    emitSocketEvent(
      req,
      participant._id.toString(),
      { payload },
      EventEnums.UPDATE_GROUP_NAME
    );
  });

  return res.status(200).json({
    ...new ApiResponse(200, payload, "Chat Name updated successfully"),
  });
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const _chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatAggregator(),
  ]);

  const chat = _chat[0];

  if (!chat) throw new ApiError(404, "Group chat not found");

  if (chat.admin.toString() !== req.user._id.toString())
    throw new ApiError(400, "You are not an admin");

  await Chat.findByIdAndDelete(chat._id);

  await removeDeletedCloudinaryMedia(chat._id);

  chat.participants.forEach((participant) => {
    // if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id.toString(),
      { payload: chat },
      EventEnums.LEAVE_CHAT
    );
  });

  return res.status(200).json({
    ...new ApiResponse(200, chat, "Chat deleted Successfully"),
  });
});

const deleteOneOnOneChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatAggregator(),
  ]);

  const payload = chat[0];

  if (!payload) throw new ApiError(404, "chat not found");

  await Chat.findByIdAndDelete(chatId);

  await removeDeletedCloudinaryMedia(chatId);

  const otherParticipant = payload.participants?.find(
    (participant) => participant._id.toString() !== req.user._id.toString()
  );

  emitSocketEvent(
    req,
    otherParticipant._id?.toString(),
    { payload },
    EventEnums.LEAVE_CHAT
  );

  emitSocketEvent(
    req,
    req.user?._id?.toString(),
    { payload },
    EventEnums.LEAVE_CHAT
  );

  return res.status(200).json({
    ...new ApiResponse(200, {}, "chat deleted successfully"),
  });
});

const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const groupChat = await Chat.findOne({
    _id: chatId,
    isGroupChat: true,
  });

  if (!groupChat) throw new ApiError(404, "Group not found");

  if (!groupChat.participants?.includes(req.user._id))
    throw new ApiError(400, "You are not a part of this group");

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: req.user?._id,
      },
    },
    { new: true }
  );

  const aggregatedChat = await Chat.aggregate([
    {
      $match: {
        _id: chat._id,
      },
    },
    ...chatAggregator(),
  ]);

  const payload = aggregatedChat[0];

  if (!payload) throw new ApiError(500, "Internal server error");

  return res.status(200).json({
    ...new ApiResponse(200, payload, "Left group successfully"),
  });
});

const addNewParticipants = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) throw new ApiError(404, "Group not found");

  if (groupChat.admin?.toString() !== req.user._id.toString())
    throw new ApiError(400, "You are not an Admin");

  if (groupChat.participants?.includes(participantId))
    throw new ApiError(400, "User is already part of the group");

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        participants: participantId,
      },
    },
    { new: true }
  );

  const aggregatedChat = await Chat.aggregate([
    {
      $match: {
        _id: chat._id,
      },
    },
    ...chatAggregator(),
  ]);

  const payload = aggregatedChat[0];

  if (!payload) throw new ApiError(500, "Internal server error");

  emitSocketEvent(req, participantId, { payload }, EventEnums.NEW_CHAT);

  return res.status(200).json({
    ...new ApiResponse(200, payload, "Participant added successfully"),
  });
});

const removeParticipant = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  const groupChat = await Chat.findOne({
    _id: chatId,
    isGroupChat: true,
  });

  if (!groupChat) throw new ApiError(404, "Group not found");

  if (groupChat.admin.toString() !== req.user._id.toString())
    throw new ApiError(404, "You are not an Admin");

  if (!groupChat.participants?.includes(participantId))
    throw new ApiError(400, "Participant does not exists in group");

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId,
      },
    },
    { new: true }
  );

  const aggregatedChat = await Chat.aggregate([
    {
      $match: {
        _id: chat._id,
      },
    },
    ...chatAggregator(),
  ]);

  const payload = aggregatedChat[0];

  if (!payload) throw new ApiError(500, "Internal Server Error");

  emitSocketEvent(req, participantId, { payload }, EventEnums.LEAVE_CHAT);

  return res.status(200).json({
    ...new ApiResponse(200, payload, "Participant removed Successfully"),
  });
});

const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: {
          $elemMatch: {
            $eq: req.user._id,
          },
        },
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...chatAggregator(),
  ]);

  return res.status(200).json({
    ...new ApiResponse(200, chats || [], "Successfully fetched chats"),
  });
});

export {
  addNewParticipants,
  createGroupChat,
  createOrFetchOneOnOneChat,
  deleteGroupChat,
  deleteOneOnOneChat,
  getAllChats,
  getGroupDetails,
  leaveGroupChat,
  removeParticipant,
  renameGroupChat,
  getUsers,
};
