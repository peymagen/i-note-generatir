import { body } from "express-validator";

export const createINote = [
    body("iNote").isNumeric().notEmpty().withMessage("title is required"),
];