import mongoose from "mongoose";
import { UserRoleEnums, UserRoles } from "../constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Username is Required"],
    lowercase: true,
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password must be at least 8 characters"],
  },

  avatar: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },

  role: {
    type: String,
    default: UserRoles.USER_ROLE,
    enum: UserRoleEnums,
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  utitlityToken: {
    type: String,
    default: null,
  },

  utitlityTokenExpiry: {
    type: Date,
    default: null,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function (password) {
  return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model("user", userSchema);
