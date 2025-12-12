import pool from "../config/db.js";

export const createPayment = async ({
  user_id,
  paket_id,
  total,
  qris_url,
  note,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO payments (user_id, paket_id, total, qris_url, note)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, paket_id, total, qris_url || null, note || null]
  );
  return rows[0];
};

export const getPaymentById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM payments WHERE id = $1`, [
    id,
  ]);
  return rows[0] || null;
};

export const getPaymentsByUser = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );
  return rows;
};

export const listPendingPayments = async () => {
  const { rows } = await pool.query(
    `SELECT p.*, u.username as user_name FROM payments p
     LEFT JOIN users u ON u.id = p.user_id
     WHERE p.status = 'menunggu_verifikasi_admin' OR p.status = 'pending'
     ORDER BY p.created_at DESC`
  );
  return rows;
};

export const setPaymentStatus = async ({ id, status, approved_by = null }) => {
  const approved_at_sql = status === "paid" ? ", approved_at = now()" : "";
  const approved_by_val = approved_by ? approved_by : null;

  const { rows } = await pool.query(
    `UPDATE payments
     SET status = $1, updated_at = now(), approved_by = $2 ${approved_at_sql}
     WHERE id = $3
     RETURNING *`,
    [status, approved_by_val, id]
  );
  return rows[0];
};
