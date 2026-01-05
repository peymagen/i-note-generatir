import { body } from "express-validator";

export const createPoHeader = [

  body("IndentNo")
    .notEmpty().withMessage("Indent No is required")
    .isString().withMessage("Indent No must be a string"),
    
  body("VendorCode")
    .notEmpty().withMessage("Vendor Code is required")
    .isString().withMessage("Vendor Code must be a string"),
    
  body("OrderDate")
    .notEmpty().withMessage("Order Date is required")
    .isISO8601().withMessage("Order Date must be a valid date (YYYY-MM-DD)"),
    
  body("ValueRs")
    .notEmpty().withMessage("Value is required")
    .isString().withMessage("Value must be a string"),
    
  body("InspectingAgencyType")
    .notEmpty().withMessage("Inspecting Agency Type is required")
    .isString().withMessage("Inspecting Agency Type must be a string"),
    
  body("InspectorCode")
    .notEmpty().withMessage("Inspector Code is required")
    .isString().withMessage("Inspector Code must be a string"),
    
  body("InspectionSiteCode")
    .notEmpty().withMessage("Inspection Site Code is required")
    .isString().withMessage("Inspection Site Code must be a string"),
    
  body("Remarks")
    .notEmpty().withMessage("Remarks are required")
    .isString().withMessage("Remarks must be a string"),
    
  body("QuoteKey")
    .notEmpty().withMessage("Quote Key is required")
    .isNumeric().withMessage("Quote Key must be a number"),
    
  body("SelectedQuoteDate")
    .notEmpty().withMessage("Selected Quote Date is required")
    .isISO8601().withMessage("Selected Quote Date must be a valid date"),
    
  body("DateTimeApproved")
    .optional()
    .isISO8601().withMessage("Date Time Approved must be a valid date"),
    
  body("ApprovedBy")
    .optional()
    .isString().withMessage("Approved By must be a string"),
    
  body("TypeClosing")
    .optional()
    .isString().withMessage("Type Closing must be a string"),
    
  body("DateCloded")
    .optional()
    .isISO8601().withMessage("Date Closed must be a valid date"),
    
  body("ClosedBy")
    .optional()
    .isString().withMessage("Closed By must be a string"),
    
  body("PackingInstruction")
    .notEmpty().withMessage("Packing Instruction is required")
    .isString().withMessage("Packing Instruction must be a string"),
    
  body("DespatchInstruction")
    .notEmpty().withMessage("Despatch Instruction is required")
    .isString().withMessage("Despatch Instruction must be a string"),
    
  body("InspectionInstruction")
    .notEmpty().withMessage("Inspection Instruction is required")
    .isObject().withMessage("Inspection Instruction must be an object"),
    
  body("StationCode")
    .notEmpty().withMessage("Station Code is required")
    .isString().withMessage("Station Code must be a string"),
    
  body("Remarks1")
    .notEmpty().withMessage("Remarks1 are required")
    .isString().withMessage("Remarks1 must be a string"),
    
  body("Name")
    .notEmpty().withMessage("Name is required")
    .isString().withMessage("Name must be a string"),
    
  body("City")
    .notEmpty().withMessage("City is required")
    .isString().withMessage("City must be a string"),
    
  body("State")
    .notEmpty().withMessage("State is required")
    .isString().withMessage("State must be a string")
];


