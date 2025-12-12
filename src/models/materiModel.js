import pool from "../config/db.js";

// CREATE MATERI
export const createMateri = async (data) => {
  const q = `
    INSERT INTO materi 
      (judul, konten, file_url, guru_id, slug, deskripsi, tipe, kategori_id, durasi, kelas)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

  const vals = [
    data.judul,
    data.konten,
    data.file_url || null,
    data.guru_id,
    data.slug,
    data.deskripsi || null,
    data.tipe || null,
    data.kategori_id || null,
    data.durasi || null,
    data.kelas || null,
  ];

  const { rows } = await pool.query(q, vals);
  return rows[0];
};

// GET DETAIL MATERI BY ID
export const getMateriById = async (id) => {
  const q = `SELECT * FROM materi WHERE id = $1`;
  const { rows } = await pool.query(q, [id]);
  return rows[0];
};

// LIST MATERI + SEARCH
export const listMateri = async (opts = {}) => {
  const { q, kategori_id, limit = 100 } = opts;

  // Prioritas 1 — Search
  if (q) {
    const sql = `
      SELECT * FROM materi
      WHERE 
        LOWER(judul) LIKE LOWER($1)
        OR LOWER(deskripsi) LIKE LOWER($1)
        OR LOWER(slug) LIKE LOWER($1)
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(sql, [`%${q}%`, limit]);
    return rows;
  }

  // Prioritas 2 — Filter subkategori
  if (kategori_id) {
    const sql = `
      SELECT * FROM materi
      WHERE kategori_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(sql, [kategori_id, limit]);
    return rows;
  }

  // Default — Semua materi
  const sql = `
    SELECT * FROM materi
    ORDER BY created_at DESC
    LIMIT $1
  `;
  const { rows } = await pool.query(sql, [limit]);
  return rows;
};

// UPDATE MATERI
export const updateMateriById = async (
  id,
  guruId,
  judul,
  konten,
  file_url,
  deskripsi,
  tipe,
  kategori_id,
  durasi,
  kelas
) => {
  const q = `
    UPDATE materi
    SET 
      judul = $3,
      konten = $4,
      file_url = COALESCE($5, file_url),
      deskripsi = $6,
      tipe = $7,
      kategori_id = $8,
      durasi = $9,
      kelas = $10,
      updated_at = NOW()
    WHERE id = $1 AND guru_id = $2
    RETURNING *
  `;

  const vals = [
    id,
    guruId,
    judul,
    konten,
    file_url || null,
    deskripsi || null,
    tipe || null,
    kategori_id || null,
    durasi || null,
    kelas || null,
  ];

  const { rows } = await pool.query(q, vals);
  return rows[0];
};

// DELETE MATERI
export const deleteMateriById = async (id, guruId) => {
  const q = `
    DELETE FROM materi
    WHERE id = $1 AND guru_id = $2
    RETURNING id
  `;

  const { rows } = await pool.query(q, [id, guruId]);
  return rows[0];
};
