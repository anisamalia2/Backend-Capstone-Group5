import pool from "../config/db.js";

export const createQuiz = async ({ judul, kategori_id, kelas, guru_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO quiz (judul, kategori_id, kelas, guru_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [judul, kategori_id, kelas, guru_id]
  );
  return rows[0];
};

export const updateQuizData = async (
  id,
  { judul, kategori_id, kelas, guru_id }
) => {
  const { rows } = await pool.query(
    `UPDATE quiz SET judul=$1, kategori_id=$2, kelas=$3 WHERE id=$4 AND guru_id=$5 RETURNING *`,
    [judul, kategori_id, kelas, id, guru_id]
  );
  return rows[0];
};

export const addSoal = async ({
  quiz_id,
  pertanyaan,
  tipe,
  opsi,
  jawaban,
  penjelasan,
}) => {
  await pool.query(
    `INSERT INTO soal (quiz_id, pertanyaan, tipe, opsi, jawaban, penjelasan) VALUES ($1, $2, $3, $4, $5, $6)`,
    [quiz_id, pertanyaan, tipe, JSON.stringify(opsi), jawaban, penjelasan]
  );
};

export const deleteAllSoalByQuizId = async (quiz_id) => {
  await pool.query(`DELETE FROM soal WHERE quiz_id = $1`, [quiz_id]);
};

export const getAllQuizWithSoal = async () => {
  const { rows } = await pool.query(`
    SELECT q.*, 
    (SELECT json_agg(s.*) FROM soal s WHERE s.quiz_id = q.id) as soal
    FROM quiz q ORDER BY q.created_at DESC
  `);
  return rows;
};

export const getQuizWithSoal = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT q.*, 
    (SELECT json_agg(s.*) FROM soal s WHERE s.quiz_id = q.id) as soal
    FROM quiz q WHERE q.id = $1
  `,
    [id]
  );
  return rows[0];
};

export const deleteQuiz = async (id, guru_id) => {
  await pool.query(`DELETE FROM quiz WHERE id = $1 AND guru_id = $2`, [
    id,
    guru_id,
  ]);
};

export const saveQuizResult = async ({
  user_id,
  quiz_id,
  skor,
  jawab_json,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO quiz_results (user_id, quiz_id, skor, jawab_json) VALUES ($1, $2, $3, $4) RETURNING *`,
    [user_id, quiz_id, skor, JSON.stringify(jawab_json)]
  );
  return rows[0];
};

export const getLastQuizResult = async (user_id, quiz_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM quiz_results WHERE user_id = $1 AND quiz_id = $2 ORDER BY created_at DESC LIMIT 1`,
    [user_id, quiz_id]
  );
  return rows[0];
};
