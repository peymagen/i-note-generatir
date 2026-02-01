import { Router } from "express";
import { catchError } from "../../common/middleware/cath-error.middleware";
import * as uploadController from "./upload.controller";
import { upload } from "../../common/middleware/multer.middleware";

const router = Router();

router.post("/", upload.single("file"), catchError, uploadController.create);

export default router;
