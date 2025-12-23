import { Router } from "express";
import { catchError } from "../../common/middleware/cath-error.middleware";
import * as controller from './vendor.controller'
import { upload } from "../../common/middleware/multer.middleware";
import { roleAuth } from "../../common/middleware/role-auth.middleware";

const router = Router();

 router
.get(
    "/",
    controller.getAllData
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
    catchError,
    controller.createRow
)
.put(
    "/:id",
    roleAuth(),
    controller.updateRow 
)
.delete(
    '/:id',
    controller.deleteById
)
export default router

 




// CREATE TABLE vendor_Detail (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId INT,
//     FirmName VARCHAR(255),
//     vendorCode VARCHAR(255),
//     FirmAddress VARCHAR(255),
//     FirmEmailId VARCHAR(255),
//     updateBy INT DEFAULT NULL,   -- FIXED TYPE
//     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
//     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    
//     CONSTRAINT fk_vendor_creator 
//         FOREIGN KEY (userId) REFERENCES users(id)
//             ON DELETE SET NULL ON UPDATE CASCADE,

//     CONSTRAINT fk_vendor_updater 
//         FOREIGN KEY (updateBy) REFERENCES users(id)
//             ON DELETE SET NULL ON UPDATE CASCADE
// );
