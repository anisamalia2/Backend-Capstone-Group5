import pool from "../config/db.js";

export const createPaket = async (nama, harga, duration_months) => {
  const result = await pool.query(
    `INSERT INTO paket (nama, harga, duration_months)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nama, harga, duration_months]
  );
  return result.rows[0];
};

export const getAllPaket = async () => {
  const result = await pool.query(`SELECT * FROM paket ORDER BY id ASC`);
  return result.rows;
};

export const getPaketById = async (id) => {
  const result = await pool.query(`SELECT * FROM paket WHERE id = $1`, [id]);
  return result.rows[0];
};

export const updatePaket = async (id, nama, harga, duration_months) => {
  // Ambil data lama dulu
  const existing = await pool.query(`SELECT * FROM paket WHERE id = $1`, [id]);
  if (existing.rows.length === 0) return null;

  const old = existing.rows[0];

  const result = await pool.query(
    `UPDATE paket
     SET nama = $1,
         harga = $2,
         duration_months = $3
     WHERE id = $4
     RETURNING *`,
    [
      nama ?? old.nama,
      harga ?? old.harga,
      duration_months ?? old.duration_months,
      id,
    ]
  );

  return result.rows[0];
};

export const deletePaket = async (id) => {
  await pool.query(`DELETE FROM paket WHERE id = $1`, [id]);
  return true;
};
