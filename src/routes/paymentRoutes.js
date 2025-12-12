import express from "express";
import { verifyToken } from "../middleware/auth.js";
import roleGuru from "../middleware/roleGuru.js";
import {
  createPayment,
  confirmPayment,
  getPaymentStatus,
  listPayments,
  approvePayment,
  rejectPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create transaksi (user)
router.post("/create", verifyToken, createPayment);

// User konfirmasi sudah bayar (klik "Saya sudah bayar")
router.post("/confirm", verifyToken, confirmPayment);

// Ambil status transaksi
router.get("/status/:id", verifyToken, getPaymentStatus);

// Admin routes (role GURU digunakan untuk admin/verifier)
router.get("/list", verifyToken, roleGuru, listPayments);
router.post("/approve/:id", verifyToken, roleGuru, approvePayment);
router.post("/reject/:id", verifyToken, roleGuru, rejectPayment);

export default router;
