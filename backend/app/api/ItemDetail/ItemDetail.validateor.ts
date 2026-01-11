// PODetail.validateor.ts
import { body } from "express-validator";

export const itemImportValidation = [
  // For strings that can be empty
  body("IndentNo").optional({ values: 'falsy' }).isString(),
  body("VendorCode").optional({ values: 'falsy' }).isString(),
  
  // For dates (Crucial: this prevents the "Invalid Value" error for empty strings)
  body("OrderDate").optional({ values: 'falsy' }).isISO8601(),
  body("DateTimeApproved").optional({ values: 'falsy' }).isISO8601(),

  // For numbers
  body("OrderLineNo").optional({ values: 'falsy' }).isInt(),
  body("MonthsShelfLife").optional({ values: 'falsy' }).isInt(),

  // The rest of your fields...
  body("ItemCode").optional({ values: 'falsy' }).isString(),
  body("SectionHead").optional({ values: 'falsy' }).isString(),
  body("ItemDesc").optional({ values: 'falsy' }).isString(),
  body("CountryCode").optional({ values: 'falsy' }).isString(),
  body("ItemDeno").optional({ values: 'falsy' }).isString(),
  body("CRPCategory").optional({ values: 'falsy' }).isString(),
  body("VEDCCategory").optional({ values: 'falsy' }).isString(),
  body("ABCCategory").optional({ values: 'falsy' }).isString(),
  body("ApprovedBy").optional({ values: 'falsy' }).isString(),
  body("ReviewSubSectionCode").optional({ values: 'falsy' }).isString(),
  body("INCATYN").optional({ values: 'falsy' }).isString(),
];


export const itemImportSchema = itemImportValidation;