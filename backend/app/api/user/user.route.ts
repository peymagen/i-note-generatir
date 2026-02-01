import { Router } from "express";
import { catchError } from "../../common/middleware/cath-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { upload } from "../../common/middleware/multer.middleware";

const router = Router();

router
  .get("/", userController.getAllUser)
  .get("/:id", userController.getUserById)
  .delete("/:id", userController.deleteUser)
  .patch("/toggle/:id", userController.toggleUserStatus)
  .post(
    "/",
    upload.none(),
    userValidator.createUser,
    catchError,
    userController.createUser
  )
  .post(
    "/login",
    upload.none(),
    userValidator.loginUser,
    catchError,
    userController.loginUser
  )
  .put(
    "/:id",
    upload.none(),
    userValidator.updateUser,
    catchError,
    userController.updateUser
  )
  .put(
    "/change-password/:id",
    upload.none(),
    catchError,
    userController.changePassword
  );
// .patch(
//   "/:id",
//   upload.none(),
//   userValidator.editUser,
//   catchError,
//   userController.editUser
// );

export default router;
