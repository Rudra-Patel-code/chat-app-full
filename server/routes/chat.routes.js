import express from "express";
import {
  addNewParticipants,
  createGroupChat,
  createOrFetchOneOnOneChat,
  deleteGroupChat,
  deleteOneOnOneChat,
  getAllChats,
  getGroupDetails,
  getUsers,
  leaveGroupChat,
  removeParticipant,
  renameGroupChat,
} from "../controllers/chat.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(isAuth);

router.route("/users").get(getUsers);

router
  .route("/create/one/:participantId")
  .post(isAuth, createOrFetchOneOnOneChat);

router.route("/create/group").post(isAuth, createGroupChat);

router.route("/chats").get(getAllChats);

router
  .route("/group/:chatId")
  .get(getGroupDetails)
  .patch(renameGroupChat)
  .delete(deleteGroupChat);

router
  .route("/group/:chatId/:participantId")
  .post(addNewParticipants)
  .delete(removeParticipant);

router.route("/leave/group/:chatId").delete(leaveGroupChat);

router.route("/remove/:chatId").delete(deleteOneOnOneChat);

export default router;
