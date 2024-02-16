import { httpServer } from "./app.js";
import { connectDB } from "./db/connectDB.js";
import { v2 as cloudinary } from "cloudinary";

const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(
      `============================\nServer listening on ${PORT}\n===============================`
    );
  });
};

startServer();
