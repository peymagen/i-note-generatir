import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const excelFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    console.log("Hello excel")
  } else {
    cb(new Error("Only Excel files are allowed"));
    console.log("Lol")
  }
};

export const excelUpload = multer({
  storage,
  fileFilter: excelFileFilter,
});
