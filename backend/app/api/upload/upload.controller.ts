import { createResponse } from "../../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.send(createResponse("No File Uploaded"));
  }
  res.send(
    createResponse(
      { url: process.env.URL + "/uploads/" + req.file?.filename },
      "uploaded sucssefully"
    )
  );
});
