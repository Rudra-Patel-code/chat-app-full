import { ApiError } from "../helpers/ApiError.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(400, "Token is missing");

  try {
    const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(_id).select(
      "-password -utitlityToken -utitlityTokenExpiry"
    );

    if (!user) throw new ApiError(400, "Invalid Access Token");

    req.user = user;
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Invalid Access Token");
  }

  next();
});

const isEmailVerified = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!req.user.isEmailVerified)
    throw new ApiError(400, "Please Verify your Email Address");

  next();
});

export { isAuth };
