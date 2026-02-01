import { body } from "express-validator";

export const createMoDetail = [

  body("MoCPRO")
    .notEmpty().withMessage("MoCPRO is required")
    .isString().withMessage("MoCPRO must be a string"),
    
  body("MoAddress")
    .notEmpty().withMessage("Mo Address is required")
    .isString().withMessage("Mo Address must be a string")
];

export const updateMoDetail = [
  body("MoCPRO")
    .optional()
    .isString().withMessage("MoCPRO must be a string"),
    
  body("MoAddress")
    .optional()
    .isString().withMessage("Mo Address must be a string")
];