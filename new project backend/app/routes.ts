import express from "express";
import userRoutes from "./api/user/user.route";
import pageRoutes from "./api/page/page.route";     
import itemDetail from "./api/ItemDetail/ItemDetail.route";
import poHeader from "./api/PoHeader/PoHeader.route";
import poDetail from "./api/POdDetail/PoDetail.route";
import vendor_Detail from './api/vendor_Detail/vendor.route'
import moDetail from './api/MoDetail/mo.route'      

// routes
const router = express.Router();
router.use("/users", userRoutes);

router.use("/pages", pageRoutes);
router.use("/item-detail", itemDetail);
router.use("/po-header", poHeader);
router.use("/po-detail", poDetail);
router.use('/vendor-detail',vendor_Detail)
router.use('/mo-detail',moDetail)
export default router;

