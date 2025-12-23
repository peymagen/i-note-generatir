import { body } from "express-validator";

export const createPage = [
  body("title").notEmpty().withMessage("title is required"),
  body("content").notEmpty().withMessage("content is required"),
];

export const updatePage = [
  body("title").optional().notEmpty().withMessage("title cannot be empty"),
  body("content").optional().notEmpty().withMessage("content cannot be empty"),
];
