import { User } from "../models/user.model.js";
import { ApiError } from "../helpers/ApiError.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";
import { getDataUri } from "../utils/getDataUri.js";
import jwt from "jsonwebtoken";
import {
    emailVerificationMailContent,
    forgotPasswordMailgenContent,
    sendMail,
} from "../utils/mail.js";
import crypto from "crypto";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};

const generateUtitlityToken = () => {
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    // This should stay in the DB to compare at the time of verification
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    // This is the expiry time for the token (20 minutes)
    const tokenExpiry = Date.now() + 30 * 60 * 1000; //30 min

    return { hashedToken, tokenExpiry, unHashedToken };
};

const registerUser = asyncHandler(async (req, res, next) => {
    const { email, username, password, confirmPassword } = req.body;
    const file = req.file;

    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and Confirm Password doesn't match");
    }

    const isEmailUser = await User.findOne({ email });
    if (isEmailUser) throw new ApiError(400, "Email Already in Use");

    let newUser;

    if (file) {
        const fileDataUri = getDataUri(file);
        const cloudResult = await cloudinary.uploader.upload(
            fileDataUri.content
        );
        newUser = await User.create({
            email,
            password,
            username,
            avatar: {
                url: cloudResult.url,
                public_id: cloudResult.public_id,
            },
        });
    } else {
        newUser = await User.create({
            email,
            password,
            username,
            avatar: {
                url: "http://res.cloudinary.com/di2nyulhu/image/upload/v1697003070/yf2tbttw0i2hp6fdozwx.webp",
                public_id: "yf2tbttw0i2hp6fdozwx",
            },
        });
    }

    const accessToken = newUser.generateToken();

    newUser = await User.findById(newUser._id).select(
        "-password -utitlityToken -utitlityTokenExpiry"
    );

    res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json({
            ...new ApiResponse(
                200,
                { user: newUser, accessToken },
                "Registered Successfully"
            ),
        });
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    let user = await User.findOne({ username });

    if (!user) throw new ApiError(404, "User not found");

    const isPasswordCorrect = await user.isPassword(password);

    if (!isPasswordCorrect) throw new ApiError(400, "Invalid password");

    const accessToken = user.generateToken();

    user = await User.findById(user._id).select(
        "-password -utitlityToken -utitlityTokenExpiry"
    );

    res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json({
            ...new ApiResponse(
                200,
                { user, accessToken },
                "Logged in successfully"
            ),
        });
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            utitlityToken: undefined,
        },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .json({ ...new ApiResponse(200, {}, "Logged Out Successfully") });
});

const sendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);

    if (!user) throw new ApiError(400, "User not found");

    if (user.isEmailVerified) throw new ApiError(400, "Email Already verified");

    const { hashedToken, tokenExpiry, unHashedToken } = generateUtitlityToken();

    user.utitlityToken = hashedToken;
    user.utitlityTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendMail({
        email: user.email,
        subject: "Please verify Your Email",
        mailgenContent: emailVerificationMailContent(
            user.username,
            `${req.protocol}://${req.get(
                "host"
            )}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });

    return res.status(200).json({
        ...new ApiResponse(200, {}, "Verification Email Sent Successfully"),
    });
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        utitlityToken: hashedToken,
        utitlityTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
        throw new ApiError(400, "Token Expired or Invalid. Please try again.");

    user.utitlityToken = undefined;
    user.utitlityTokenExpiry = undefined;

    user.isEmailVerified = true;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
        ...new ApiResponse(
            200,
            { isEmailVerified: user.isEmailVerified },
            "Email verified successfully"
        ),
    });
});

const forgetPasswordRequest = asyncHandler(async (req, res) => {
    const { email, frontEndUrl } = req.body;

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(400, "User not found. Invalid Email");

    if (user.isEmailVerified) throw new ApiError(400, "Please verify Email ");

    const { hashedToken, tokenExpiry, unHashedToken } = generateUtitlityToken();

    user.utitlityToken = hashedToken;
    user.utitlityTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendMail({
        email: user.email,
        subject: "Forget Password Request",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${frontEndUrl}/api/v1/users/reset-password/${unHashedToken}`
        ),
    });

    return res.status(200).json({
        ...new ApiResponse(200, {}, "Please Check Your Email"),
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const { resetToken } = req.params;

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        utitlityToken: hashedToken,
        utitlityTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
        throw new ApiError(400, "Token Expired or Invalid. Please try again.");

    user.utitlityToken = undefined;
    user.utitlityTokenExpiry = undefined;

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
        ...new ApiResponse(
            200,
            {},
            "Password updated successfully. Go ahead and Login"
        ),
    });
});

export {
    registerUser,
    loginUser,
    logoutUser,
    sendEmailVerification,
    verifyEmail,
    forgetPasswordRequest,
    resetPassword,
};
