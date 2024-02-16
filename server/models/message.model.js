import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    content: {
      type: String,
    },

    attachments: {
      type: [
        {
          url: {
            type: String,
          },
          public_id: String,
        },
      ],
      default: [],
    },

    partof: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);

export default Message;
