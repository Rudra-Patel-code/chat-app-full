import mongoose from "mongoose";

const DB_URI = process.env.DB_URI;

export let dbInstance = undefined;

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(`${DB_URI}/CHAT-APP`);
    dbInstance = connection;

    console.log(
      `\n\n==============================\nConnected To Mongo DB: ${connection.connection.host}\n========================`
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
