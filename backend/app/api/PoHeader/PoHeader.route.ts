import { Router, Request, Response, NextFunction } from 'express';
import * as controller from './PoHeader.controller';
import { roleAuth } from '../../common/middleware/role-auth.middleware';
import { excelUpload } from "../../common/middleware/excel-upload.middleware";
import { catchError } from '../../common/middleware/cath-error.middleware';
import * as validator from './PoHeader.validator'
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

router.post(
  "/",
  roleAuth(),
  catchError,
  validator.createPoHeader,
  controller.addData
)


router.get(
  "/",
  roleAuth(),
  catchError,
  controller.getItemPageSearch
);

router.get(
  '/search',
  roleAuth(),
  catchError,
  controller.searchPO
)

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
)



export default router;