
import { body } from "express-validator";

export const createPoDetail = [

  body("IndentNo")
    .notEmpty().withMessage("Indent No is required")
    .isString().withMessage("Indent No must be a string"),
    
  body("VendorCode")
    .notEmpty().withMessage("Vendor Code is required")
    .isString().withMessage("Vendor Code must be a string"),
    
  body("OrderDate")
    .notEmpty().withMessage("Order Date is required")
    .isISO8601().withMessage("Order Date must be a valid date (YYYY-MM-DD)"),
    
  body("OrderLineNo")
    .notEmpty().withMessage("Order Line No is required")
    .isNumeric().withMessage("Order Line No must be a number")
    .isInt({ min: 1 }).withMessage("Order Line No must be greater than 0"),
    
  body("ItemCode")
    .notEmpty().withMessage("Item Code is required")
    .isString().withMessage("Item Code must be a string"),
    
  body("ConsigneeCode")
    .notEmpty().withMessage("Consignee Code is required")
    .isString().withMessage("Consignee Code must be a string"),
    
  body("OrderLineDRB")
    .notEmpty().withMessage("Order Line DRB is required")
    .isString().withMessage("Order Line DRB must be a string"),
    
  body("Specs")
    .notEmpty().withMessage("Specs are required")
    .isString().withMessage("Specs must be a string"),
    
  body("Qty")
    .notEmpty().withMessage("Quantity is required")
    .isNumeric().withMessage("Quantity must be a number")
    .isFloat({ min: 0 }).withMessage("Quantity cannot be negative"),
    
  body("UniCostCC")
    .notEmpty().withMessage("Unit Cost is required")
    .isNumeric().withMessage("Unit Cost must be a number")
    .isFloat({ min: 0 }).withMessage("Unit Cost cannot be negative"),
    
  body("PilotSampleDRb")
    .optional()
    .isString().withMessage("Pilot Sample DRb must be a string or null"),
    
  body("MIQPQty")
    .notEmpty().withMessage("MIQP Quantity is required")
    .isNumeric().withMessage("MIQP Quantity must be a number")
    .isFloat({ min: 0 }).withMessage("MIQP Quantity cannot be negative"),
    
  body("PackType")
    .notEmpty().withMessage("Pack Type is required")
    .isString().withMessage("Pack Type must be a string"),
    
  body("StationCode")
    .notEmpty().withMessage("Station Code is required")
    .isString().withMessage("Station Code must be a string"),
    
  body("ReReferencedItemCode")
    .optional()
    .isString().withMessage("Re-Referenced Item Code must be a string or null")
];

export const updatePoDetail = [
  body("IndentNo")
    .optional()
    .isString().withMessage("Indent No must be a string"),
    
  body("VendorCode")
    .optional()
    .isString().withMessage("Vendor Code must be a string"),
    
  body("OrderDate")
    .optional()
    .isISO8601().withMessage("Order Date must be a valid date (YYYY-MM-DD)"),
    
  body("OrderLineNo")
    .optional()
    .isNumeric().withMessage("Order Line No must be a number")
    .isInt({ min: 1 }).withMessage("Order Line No must be greater than 0"),
    
  body("ItemCode")
    .optional()
    .isString().withMessage("Item Code must be a string"),
    
  body("ConsigneeCode")
    .optional()
    .isString().withMessage("Consignee Code must be a string"),
    
  body("OrderLineDRB")
    .optional()
    .isString().withMessage("Order Line DRB must be a string"),
    
  body("Specs")
    .optional()
    .isString().withMessage("Specs must be a string"),
    
  body("Qty")
    .optional()
    .isNumeric().withMessage("Quantity must be a number")
    .isFloat({ min: 0 }).withMessage("Quantity cannot be negative"),
    
  body("UniCostCC")
    .optional()
    .isNumeric().withMessage("Unit Cost must be a number")
    .isFloat({ min: 0 }).withMessage("Unit Cost cannot be negative"),
    
  body("PilotSampleDRb")
    .optional()
    .isString().withMessage("Pilot Sample DRb must be a string or null"),
    
  body("MIQPQty")
    .optional()
    .isNumeric().withMessage("MIQP Quantity must be a number")
    .isFloat({ min: 0 }).withMessage("MIQP Quantity cannot be negative"),
    
  body("PackType")
    .optional()
    .isString().withMessage("Pack Type must be a string"),
    
  body("StationCode")
    .optional()
    .isString().withMessage("Station Code must be a string"),
    
  body("ReReferencedItemCode")
    .optional()
    .isString().withMessage("Re-Referenced Item Code must be a string or null")
];