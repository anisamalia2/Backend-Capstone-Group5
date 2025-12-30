import express from "express";
import { body } from "express-validator";
import { runValidation } from "../middleware/validator.js";
import { verifyToken } from "../middleware/auth.js";
import {
  register,
  login,
  getMe,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

//  REGISTER
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),

    body("nomor_whatsapp")
      .notEmpty()
      .withMessage("Nomor whatsapp is required")
      .isLength({ min: 10 })
      .withMessage("Nomor whatsapp must be valid"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("role")
      .isIn(["GURU", "SISWA"])
      .withMessage("Role must be GURU or SISWA"),
  ],
  runValidation,
  register
);

//  LOGIN
router.post(
  "/login",
  [
    body("nomor_whatsapp").notEmpty().withMessage("Nomor whatsapp is required"),

    body("password").notEmpty().withMessage("Password is required"),
  ],
  runValidation,
  login
);

router.post(
  "/reset-password",
  [
    body("nomor_whatsapp").notEmpty().withMessage("Nomor whatsapp is required"),
    body("username")
      .notEmpty()
      .withMessage("Username is required for verification"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("Password min 6 chars"),
  ],
  runValidation,
  resetPassword
);

//  GET CURRENT USER (SESSION)
router.get("/me", verifyToken, getMe);

export default router;
