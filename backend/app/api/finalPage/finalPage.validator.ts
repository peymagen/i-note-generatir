import { body } from "express-validator";


export const createPage = [
    body("content").notEmpty().withMessage("content is required"),
    body("indent_no").notEmpty().withMessage("indent_no is required"),
    body("i_note").notEmpty().isNumeric().withMessage("i_note is required"),
];

export const updatePage = [
    body("content").optional().isString().withMessage("content must be a string"),
];