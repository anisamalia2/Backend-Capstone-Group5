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
  updateQuiz, // <--- SUDAH DITAMBAHKAN
} from "../controllers/quizController.js";

const router = express.Router();

// LIST QUIZ
router.get("/", listQuiz);

// HASIL QUIZ USER
router.get("/:id/result", verifyToken, getQuizResult);

// PEMBAHASAN QUIZ
router.get("/:id/pembahasan", verifyToken, pembahasanQuiz);

// DETAIL QUIZ + SOAL
router.get("/:id", getQuiz);

// SUBMIT QUIZ
router.post("/:id/submit", verifyToken, submitQuiz);

// BUAT QUIZ (GURU)
router.post("/", verifyToken, roleGuru, createQuiz);

// UPDATE QUIZ (GURU) -> ROUTE BARU UNTUK EDIT
router.put("/:id", verifyToken, roleGuru, updateQuiz);

// DELETE QUIZ
router.delete("/:id", verifyToken, roleGuru, hapusQuiz);

export default router;
