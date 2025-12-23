import multer, { StorageEngine } from "multer";
import path from "path";

// Configure storage engine and filename
const storage: StorageEngine = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

// Initialize upload middleware and add file size limit
export const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
