import { body } from "express-validator";

export const createPage = [
    body("content").notEmpty().withMessage("content is required"),
];