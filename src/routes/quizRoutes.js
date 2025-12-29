import express from "express";
import { verifyToken } from "../middleware/auth.js";
import roleGuru from "../middleware/roleGuru.js";
import {
  createQuiz,
  getQuiz,
  submitQuiz,
  hapusQuiz,
  listQuiz,
  getQuizResult,
  pembahasanQuiz,
  updateQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/", listQuiz);
router.get("/:id/result", verifyToken, getQuizResult);
router.get("/:id/pembahasan", verifyToken, pembahasanQuiz);
router.get("/:id", getQuiz);
router.post("/:id/submit", verifyToken, submitQuiz);

// Akses GURU
router.post("/", verifyToken, roleGuru, createQuiz);
router.put("/:id", verifyToken, roleGuru, updateQuiz);
router.delete("/:id", verifyToken, roleGuru, hapusQuiz);

export default router;
