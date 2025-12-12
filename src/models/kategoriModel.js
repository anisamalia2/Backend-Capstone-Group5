import pool from "../config/db.js";

export const createKategori = async (nama) => {
  const { rows } = await pool.query(
    "INSERT INTO kategori (nama) VALUES ($1) RETURNING *",
    [nama]
  );
  return rows[0];
};

export const getAllKategori = async () => {
  const { rows } = await pool.query("SELECT * FROM kategori ORDER BY id ASC");
  return rows;
};

export const updateKategori = async (id, nama) => {
  const { rows } = await pool.query(
    `UPDATE kategori SET nama=$2 WHERE id=$1 RETURNING *`,
    [id, nama]
  );
  return rows[0];
};

export const deleteKategori = async (id) => {
  await pool.query(`DELETE FROM kategori WHERE id=$1`, [id]);
};
