import * as model from "../models/paymentModel.js";
import pool from "../config/db.js";

const STATIC_QRIS_URL =
  process.env.STATIC_QRIS_URL || "https://yourcdn.com/qris.png";

export const createPayment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { paket_id } = req.body;

    if (!paket_id) {
      return res.status(400).json({ message: "paket_id required" });
    }

    // LOG DEBUG (TARUH DI SINI)
    console.log("paket_id:", paket_id);
    console.log("DB URL:", process.env.DATABASE_URL ? "OK" : "MISSING");

    // Ambil paket
    const pak = await pool.query("SELECT id, harga FROM paket WHERE id = $1", [
      paket_id,
    ]);

    const paket = pak.rows[0];
    if (!paket) {
      return res.status(404).json({ message: "paket not found" });
    }

    // Total WAJIB dari DB
    const total = paket.harga;

    const p = await model.createPayment({
      user_id,
      paket_id,
      total,
      qris_url: STATIC_QRIS_URL,
    });

    res.status(201).json({
      transaction_id: p.id,
      total: p.total,
      qris_url: p.qris_url,
      status: p.status,
    });
  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    res.status(500).json({
      message: "Create payment failed",
      error: err.message,
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { transaction_id } = req.body;
    if (!transaction_id)
      return res.status(400).json({ message: "transaction_id required" });

    const p = await model.getPaymentById(transaction_id);
    if (!p) return res.status(404).json({ message: "Transaction not found" });
    if (p.user_id !== user_id)
      return res.status(403).json({ message: "Not your transaction" });

    // perbarui status menjadi menunggu verifikasi
    const updated = await model.setPaymentStatus({
      id: transaction_id,
      status: "menunggu_verifikasi_admin",
    });

    res.json({
      message: "Pembayaran dikirim. Menunggu verifikasi admin.",
      payment: updated,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Confirm payment failed", error: err.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const id = req.params.id;
    const p = await model.getPaymentById(id);
    if (!p) return res.status(404).json({ message: "Transaction not found" });
    if (p.user_id !== user_id && req.user.role !== "GURU") {
      // hanya  guru (admin) yang bisa lihat
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: "Get status failed", error: err.message });
  }
};

// Admin (guru): list pending payments
export const listPayments = async (req, res) => {
  try {
    const list = await model.listPendingPayments();
    res.json(list);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "List payments failed", error: err.message });
  }
};

// Admin (guru): approve payment
export const approvePayment = async (req, res) => {
  try {
    const adminId = req.user.id;
    const id = req.params.id;

    const p = await model.getPaymentById(id);
    if (!p) return res.status(404).json({ message: "Transaction not found" });
    if (p.status === "paid")
      return res.status(400).json({ message: "Transaction already paid" });

    // update status -> paid
    const updated = await model.setPaymentStatus({
      id: id,
      status: "paid",
      approved_by: adminId,
    });

    // berikan akses premium kepada user — gunakan paket.duration_months jika tersedia
    try {
      const pak = await pool.query(
        "SELECT duration_months FROM paket WHERE id = $1",
        [p.paket_id]
      );
      const durationMonths = pak.rows[0] ? pak.rows[0].duration_months : 1;

      // update user's premium_until: if null => now() + duration; if exists => premium_until + duration
      await pool.query(
        `UPDATE users
         SET premium_until = CASE
           WHEN premium_until IS NULL OR premium_until < now() THEN now() + ($1 || ' month')::interval
           ELSE premium_until + ($1 || ' month')::interval
         END
         WHERE id = $2`,
        [durationMonths, p.user_id]
      );
    } catch (err) {
      console.warn(
        "paket table missing or duration issue, skipping premium update",
        err.message
      );
    }

    res.json({ message: "Payment approved", payment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approve failed", error: err.message });
  }
};

// Admin (guru): reject payment
export const rejectPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await model.getPaymentById(id);
    if (!p) return res.status(404).json({ message: "Transaction not found" });
    if (p.status === "paid")
      return res.status(400).json({ message: "Transaction already paid" });

    const updated = await model.setPaymentStatus({
      id: id,
      status: "rejected",
      approved_by: req.user.id,
    });
    res.json({ message: "Payment rejected", payment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reject failed", error: err.message });
  }
};
