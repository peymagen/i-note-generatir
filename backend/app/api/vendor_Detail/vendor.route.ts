import { Router } from "express";
import { catchError } from "../../common/middleware/cath-error.middleware";
import * as controller from './vendor.controller'
import { upload } from "../../common/middleware/multer.middleware";
import { roleAuth } from "../../common/middleware/role-auth.middleware";
import * as validator from "./vendor.validator"
import { excelUpload } from "../../common/middleware/excel-upload.middleware";

const router = Router();

router
    .post(
        "/",
        excelUpload.single("file"),
        roleAuth(),
        controller.uploadExcel
    )
    .get(
        "/",
        controller.getItemPageSearch
    )
    .get(
        '/vendorCode/:vendorCode',
        roleAuth(),
        catchError,
        controller.getByVendorCode
    )
    .post(
        '/create',
        upload.none(),
        roleAuth(),
        validator.createVendor,
        catchError,
        controller.createRow
    )
    .patch(
        "/:id",
        roleAuth(),
        validator.updateVendor,
        catchError,
        controller.updateRow
    )
    .delete(
        '/:id',
        roleAuth(),
        catchError,
        controller.deleteById
    )
export default router

