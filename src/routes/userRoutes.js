import express from "express";
import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import roleGuru from "../middleware/roleGuru.js";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, updateProfile);
router.post("/me/avatar", verifyToken, upload.single("file"), uploadAvatar);
router.get("/", verifyToken, roleGuru, getAllUsers);

export default router;
