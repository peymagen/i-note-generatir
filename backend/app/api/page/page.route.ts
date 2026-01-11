import { Router } from "express";
import { upload } from "../../common/middleware/multer.middleware";
import { catchError } from "../../common/middleware/cath-error.middleware";

import * as controller from "./page.controller";
import * as pageValidator from "./page.validator";
import { roleAuth } from "../../common/middleware/role-auth.middleware";

const router = Router();

router
  // list pages
  .get("/", controller.getAllPagesHandler)

  .get("/titles", controller.getTitle)
  .get("/content/:title", controller.getCont)

  // get by id
  .get("/:id", controller.getPageByIdHandler)

  // export PDF
  .get("/:id/export/pdf", controller.exportPagePdfHandler)

  // export DOCX
  .get("/:id/export/docx", controller.exportPageDocxHandler)

  // create
  .post(
    "/create",
    upload.none(),
    pageValidator.createPage,
    roleAuth(),
    catchError,
    controller.createPageHandler
  )

  // update
  .put(
    "/:id",
    upload.none(),
    pageValidator.updatePage,
    catchError,
    controller.updatePageHandler
  )

  // delete
  .delete("/:id", controller.deletePageHandler);

export default router;
