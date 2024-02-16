import express from "express";
import { singleUpload } from "../utils/singleUpload.js";
import {
  forgetPasswordRequest,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
// import { isAuth } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.route("/register").post(singleUpload, registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(isAuth, logoutUser);

router.route("/verify/email/send").get(isAuth, sendEmailVerification);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/forget-password/request").post(forgetPasswordRequest);

router.route("/reset-password/:resetToken").post(resetPassword);

export default router;
