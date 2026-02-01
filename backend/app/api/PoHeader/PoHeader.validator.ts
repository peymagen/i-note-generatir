import { body } from "express-validator";

export const createPoHeader = [

  body("IndentNo")
    .notEmpty().optional()
    .isString().withMessage("Indent No must be a string"),
    
  body("VendorCode")
    .notEmpty().optional()
    .isString().withMessage("Vendor Code must be a string"),
    
  body("OrderDate")
    .notEmpty().optional()
    .isISO8601().withMessage("Order Date must be a valid date (YYYY-MM-DD)"),
    
  body("ValueRs")
    .notEmpty().optional()
    .isNumeric().withMessage("Value must be a number"),
    
  body("InspectingAgencyType")
    .notEmpty().optional()
    .isString().withMessage("Inspecting Agency Type must be a string"),
    
  body("InspectorCode")
    .notEmpty().optional()
    .isString().withMessage("Inspector Code must be a string"),
    
  body("InspectionSiteCode")
    .notEmpty().optional()
    .isString().withMessage("Inspection Site Code must be a string"),
    
  body("Remarks")
    .notEmpty().optional()
    .isString().withMessage("Remarks must be a string"),
    
  body("QuoteKey")
    .notEmpty().optional()
    .isNumeric().withMessage("Quote Key must be a number"),
    
  body("SelectedQuoteDate")
    .notEmpty().optional()
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
    .notEmpty().optional()
    .isString().withMessage("Packing Instruction must be a string"),
    
  body("DespatchInstruction")
    .notEmpty().optional()
    .isString().withMessage("Despatch Instruction must be a string"),
    
  body("InspectionInstruction")
    .notEmpty().optional()
    .isObject().withMessage("Inspection Instruction must be an object"),
    
  body("StationCode")
    .notEmpty().optional()
    .isString().withMessage("Station Code must be a string"),
    
  body("Remarks1")
    .notEmpty().optional()
    .isString().withMessage("Remarks1 must be a string"),
    
  body("Name")
    .notEmpty().optional()
    .isString().withMessage("Name must be a string"),
    
  body("City")
    .notEmpty().optional()
    .isString().withMessage("City must be a string"),
    
  body("State")
    .notEmpty().optional()
    .isString().withMessage("State must be a string")
];


