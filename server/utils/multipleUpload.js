import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-app",
    format: async (req, file) => {
      let ext = path.extname(file.originalname);
      ext = ext.slice(1);

      return ext;
    },
    public_id: (req, file) => {
      return path.basename(file.originalname, path.extname(file.originalname));
    },
  },
});

const parser = multer({ storage: storage });

export default parser;
