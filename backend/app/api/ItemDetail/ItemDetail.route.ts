import { Router, Request, Response, NextFunction } from "express";
import * as controller from "./ItemDetail.controller";
import { roleAuth } from "../../common/middleware/role-auth.middleware";
import { excelUpload } from "../../common/middleware/excel-upload.middleware";
import * as validator from "./ItemDetail.validateor";
import { catchError } from "../../common/middleware/cath-error.middleware";

const router = Router();

router.post(
  "/import",
  roleAuth(),
  excelUpload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller.uploadExcel(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// router.get(
//   "/",
//   roleAuth(),
//   catchError,
//   controller.getAllPOData
// );

// router.get(
//   '/',
//   roleAuth(),
//   catchError,
//   controller.getItemsByPage
// )

router.get("/", roleAuth(), catchError, controller.getItemPageSearch);

router.get("/select", roleAuth(), catchError, controller.getItemByIndentNo);

// Get single item by ID
router.get("/:id", roleAuth(), catchError, controller.getPODataById);

router.patch(
  "/:id",
  roleAuth(),
  validator.itemImportValidation,
  catchError,
  controller.update
);

router.delete("/:id", roleAuth(), catchError, controller.deleteDataById);

router.post(
  "/",
  roleAuth(),
  validator.itemImportValidation,
  catchError,
  controller.addData
);

export default router;
