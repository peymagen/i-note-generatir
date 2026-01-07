// vendor.validator.ts
import { body } from "express-validator";

export const createVendor = [

  body("FirmName")
    .notEmpty().withMessage("Firm Name is required")
    .isString().withMessage("Firm Name must be a string")
    .trim()
    .isLength({ min: 2 }).withMessage("Firm Name must be at least 2 characters long"),

  body("FirmAddress")
    .notEmpty().withMessage("Firm Address is required")
    .isString().withMessage("Firm Address must be a string")
    .trim()
    .isLength({ min: 5 }).withMessage("Firm Address must be at least 5 characters long"),

  body("vendorCode")
    .notEmpty().withMessage("Vendor Code is required")
    .isString().withMessage("Vendor Code must be a string")
    .trim()
    .isLength({ min: 2 }).withMessage("Vendor Code must be at least 2 characters long"),

  body("FirmEmailId")
  .optional()
    .normalizeEmail(),
  body("ContactNumber")
    .optional()
    
  
];

export const updateVendor = [
  body("userId")
    .optional()
    .isNumeric().withMessage("User ID must be a number")
    .isInt({ min: 1 }).withMessage("User ID must be greater than 0"),

  body("FirmName")
    .optional()
    .isString().withMessage("Firm Name must be a string")
    .trim()
    .isLength({ min: 2 }).withMessage("Firm Name must be at least 2 characters long"),

  body("FirmAddress")
    .optional()
    .isString().withMessage("Firm Address must be a string")
    .trim()
    .isLength({ min: 5 }).withMessage("Firm Address must be at least 5 characters long"),

  body("vendorCode")
    .optional()
    .isString().withMessage("Vendor Code must be a string")
    .trim()
    .isLength({ min: 2 }).withMessage("Vendor Code must be at least 2 characters long"),

  body("FirmEmailId")
    .optional()
    .normalizeEmail(),
  body("ContactNumber")
    .optional()
    
];