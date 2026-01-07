// PODetail.validateor.ts
import { body } from "express-validator";

export const itemImportValidation = [
  
  body("IndentNo").isString().optional(),
  body("VendorCode").isString().optional(),
  body("OrderDate").isISO8601().optional(),
  body("OrderLineNo").isInt().optional(),
  body("ItemCode").isString().optional(),
  body("SectionHead").isString().optional(),
  body("ItemDesc").isString().optional(),
  body("CountryCode").isString().optional(),
  body("ItemDeno").isString().optional(),
  body("MonthsShelfLife").isInt().optional(),
  body("CRPCategory").isString().optional(),
  body("VEDCCategory").isString().optional(),
  body("ABCCategory").isString().optional(),
  body("DateTimeApproved").optional().isISO8601().optional(),
  body("ApprovedBy").optional().isString().optional(),
  body("ReviewSubSectionCode").optional().isString().optional(),
  body("INCATYN").optional().isString().optional(),
];


export const itemImportSchema = itemImportValidation;