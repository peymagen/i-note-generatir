import { Router } from "express";
import { catchError } from "../../common/middleware/cath-error.middleware";
import * as controller from "./iNote.controller";
import { upload } from "../../common/middleware/multer.middleware";
import { roleAuth } from "../../common/middleware/role-auth.middleware";
const router = Router();

router.get("/", 
    upload.none(),
    roleAuth(),
    catchError,
    controller.getInote
);


export default router;