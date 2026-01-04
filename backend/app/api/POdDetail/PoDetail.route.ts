import { Router, Request, Response, NextFunction } from 'express';
import * as controller from './PoDetail.Controller';
import { roleAuth } from '../../common/middleware/role-auth.middleware';
import { excelUpload } from "../../common/middleware/excel-upload.middleware";
import { catchError } from '../../common/middleware/cath-error.middleware';

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
router.get(
  "/getByIndent/:indentNo", 
  roleAuth(),
  catchError,
  controller.getByIndent
);

// router.get(
//   "/",
//   roleAuth(),
//   catchError,
//   controller.getAllPOData
// );

router.get(
  "/",
  roleAuth(),
  catchError,
  controller.getItemPageSearch
);

// Get single item by ID
router.get(
  "/:id",
  roleAuth(),
  catchError,
  controller.getPODataById
);

router.patch(
  "/:id",
  roleAuth(),
  catchError,
  controller.update
);

router.delete(
  "/:id",
  roleAuth(),
  catchError,
  controller.deleteDataById
);

router.post(
  "/",
  roleAuth(),
  catchError,
  controller.addData
);



export default router;