import {
  createMessage,
  getChatMessages,
} from "../controllers/message.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import express from "express";
import parser from "../utils/multipleUpload.js";

const router = express.Router();

router.use(isAuth);

router
  .route("/:chatId")
  .post(parser.array("images", 4), createMessage)
  .get(getChatMessages);

export default router;
