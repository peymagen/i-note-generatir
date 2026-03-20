import { Router } from "express";
import { catchError } from "../../common/middleware/cath-error.middleware";
import * as controller from "./export.controller";
import { upload } from "../../common/middleware/multer.middleware";
import { roleAuth } from "../../common/middleware/role-auth.middleware";

const router = Router();

router.post(
  "/docx",
  upload.none(),
  roleAuth(),
  catchError,
  controller.convertToDocx
);

export default router;
