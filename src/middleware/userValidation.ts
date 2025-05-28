import { body } from "express-validator";

export const validateCreateUser = [
  body("firstName").notEmpty().trim(),
  body("lastName").notEmpty().trim(),
  body("email").isEmail(),
  body("birthday").isISO8601().toDate(),
  body("password").isLength({ min: 6 }),
  body("role").optional().isIn(["SUPER_ADMIN", "ADMIN", "CLIENT"]),
];

export const validateUpdateUser = [
  body("firstName").optional().notEmpty().trim(),
  body("lastName").optional().notEmpty().trim(),
  body("email").optional().isEmail(),
  body("birthday").optional().isISO8601().toDate(),
  body("password").optional().isLength({ min: 6 }),
  body("role").optional().isIn(["SUPER_ADMIN", "ADMIN", "CLIENT"]),
];
