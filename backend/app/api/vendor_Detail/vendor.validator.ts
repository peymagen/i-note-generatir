// vendor.validator.ts
import { body } from "express-validator";

export const createVendor = [

  body("FirmName")
    .notEmpty().withMessage("Firm Name is required")
    .isString().withMessage("Firm Name must be a string")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Firm Name must be between 2 and 100 characters"),

  body("FirmAddress")
    .notEmpty().withMessage("Firm Address is required")
    .isString().withMessage("Firm Address must be a string")
    .trim()
    .isLength({ min: 5 }).withMessage("Firm Address must be at least 5 characters long"),

  body("vendorCode")
    .notEmpty().withMessage("Vendor Code is required")
    .isString().withMessage("Vendor Code must be a string")
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Vendor Code must be between 2 and 50 characters"),

  body("FirmEmailId")
    .notEmpty().withMessage("Firm Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  
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
    .isLength({ min: 2, max: 100 }).withMessage("Firm Name must be between 2 and 100 characters"),

  body("FirmAddress")
    .optional()
    .isString().withMessage("Firm Address must be a string")
    .trim()
    .isLength({ min: 5 }).withMessage("Firm Address must be at least 5 characters long"),

  body("vendorCode")
    .optional()
    .isString().withMessage("Vendor Code must be a string")
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Vendor Code must be between 2 and 50 characters"),

  body("FirmEmailId")
    .optional()
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("status")
    .optional()
    .isBoolean().withMessage("Status must be a boolean value"),

  body("updateBy")
    .optional()
    .isNumeric().withMessage("Update By must be a number")
    .isInt({ min: 1 }).withMessage("Update By must be greater than 0")
];