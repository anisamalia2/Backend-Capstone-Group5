import express from "express";
import { verifyToken } from "../middleware/auth.js";
import roleGuru from "../middleware/roleGuru.js";
import { getStats } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /stats - admin/dashboard summary (GURU only)
router.get("/stats", verifyToken, roleGuru, getStats);

export default router;
