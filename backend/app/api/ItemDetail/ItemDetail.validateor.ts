// PODetail.validateor.ts
import { body } from "express-validator";

export const itemImportValidation = [
  
  body("IndentNo").isString().withMessage("IndentNo must be a string"),
  body("VendorCode").isString().withMessage("VendorCode must be a string"),
  body("OrderDate").isISO8601().withMessage("OrderDate must be a valid date (YYYY-MM-DD)"),
  body("OrderLineNo").isInt().withMessage("OrderLineNo must be an integer"),
  body("ItemCode").isString().withMessage("ItemCode must be a string"),
  body("SectionHead").isString().withMessage("SectionHead must be a string"),
  body("ItemDesc").isString().withMessage("ItemDesc must be a string"),
  body("CountryCode").isString().withMessage("CountryCode must be a string"),
  body("ItemDeno").isString().withMessage("ItemDeno must be a string"),
  body("MonthsShelfLife").isInt().withMessage("MonthsShelfLife must be an integer"),
  body("CRPCategory").isString().withMessage("CRPCategory must be a string"),
  body("VEDCCategory").isString().withMessage("VEDCCategory must be a string"),
  body("ABCCategory").isString().withMessage("ABCCategory must be a string"),
  body("DateTimeApproved").optional().isISO8601().withMessage("DateTimeApproved must be a valid datetime"),
  body("ApprovedBy").optional().isString().withMessage("ApprovedBy must be a string"),
  body("ReviewSubSectionCode").optional().isString().withMessage("ReviewSubSectionCode must be a string"),
  body("INCATYN").optional().isString().withMessage("INCATYN must be a string"),
];


export const itemImportSchema = itemImportValidation;