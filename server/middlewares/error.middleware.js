import mongoose from "mongoose";
import { ApiError } from "../helpers/ApiError.js";

export const errorMiddleware = (err, req, res, next) => {
  console.log(err);

  let error = err;
  let statusCode = err.statusCode || 500;

  if (!(err instanceof ApiError)) {
    const msg = error.message || "Something went wrong";
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    error = new ApiError(statusCode, msg);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message,
    error: err,
  });
};
