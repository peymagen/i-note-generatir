import { Router} from 'express';
import * as controller from './finalPage.controller';
import { roleAuth } from '../../common/middleware/role-auth.middleware';
import { catchError } from '../../common/middleware/cath-error.middleware';
import * as validator from './finalPage.validator';

const router = Router();

router.get(
  "/",
  roleAuth(),
  catchError,
  controller.getPageInation
);

router.get(
  "/:id",
  roleAuth(),
  catchError,
  controller.getPageById
);
router.post(
    "/",
    roleAuth(),
    validator.createPage,
    catchError,
    controller.createPage
)
router.put(
    "/:id",
    roleAuth(),
    // validator.updatePage,
    catchError,
    controller.update
)
router.delete(
    "/:id",
    roleAuth(),
    catchError,
    controller.delteHandler
)
export default router;