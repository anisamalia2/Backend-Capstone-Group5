import pool from "../config/db.js";

export const createQuiz = async (quiz) => {
  const { rows } = await pool.query(
    `INSERT INTO quiz (judul, kategori_id, kelas, guru_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [quiz.judul, quiz.kategori_id, quiz.kelas, quiz.guru_id]
  );
  return rows[0];
};

export const addSoal = async (soal) => {
  const { rows } = await pool.query(
    `INSERT INTO quiz_soal (quiz_id, tipe, pertanyaan, opsi, jawaban, penjelasan)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      soal.quiz_id,
      soal.tipe,
      soal.pertanyaan,
      JSON.stringify(soal.opsi || []),
      soal.jawaban,
      soal.penjelasan || null,
    ]
  );
  return rows[0];
};

export const getQuizWithSoal = async (quiz_id) => {
  const { rows } = await pool.query(
    `SELECT 
        q.*, 
        (
          SELECT json_agg(
            json_build_object(
              'id', s.id,
              'quiz_id', s.quiz_id,
              'tipe', s.tipe,
              'pertanyaan', s.pertanyaan,
              'opsi', s.opsi,
              'jawaban', s.jawaban,
              'penjelasan', s.penjelasan
            )
          )
          FROM quiz_soal s
          WHERE s.quiz_id = q.id
        ) AS soal
     FROM quiz q
     WHERE q.id = $1`,
    [quiz_id]
  );
  return rows[0] ? { ...rows[0], soal: rows[0].soal || [] } : null;
};

export const saveQuizResult = async ({
  user_id,
  quiz_id,
  skor,
  jawab_json,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO quiz_jawaban_user (user_id, quiz_id, skor, jawab_json)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [user_id, quiz_id, skor, JSON.stringify(jawab_json)]
  );
  return rows[0];
};

export const deleteQuiz = async (id, guruId) => {
  // 1. Cek apakah quiz milik guru
  const cek = await pool.query(
    "SELECT * FROM quiz WHERE id = $1 AND guru_id = $2",
    [id, guruId]
  );

  if (cek.rowCount === 0) {
    throw new Error("Quiz tidak ditemukan atau bukan milik Anda");
  }

  // 2. Hapus hasil pengerjaan quiz (quiz_jawaban_user)
  await pool.query("DELETE FROM quiz_jawaban_user WHERE quiz_id = $1", [id]);

  // 3. Hapus semua soal quiz
  await pool.query("DELETE FROM quiz_soal WHERE quiz_id = $1", [id]);

  // 4. Baru hapus quiz
  await pool.query("DELETE FROM quiz WHERE id = $1", [id]);

  return true;
};

export const getAllQuiz = async () => {
  const { rows } = await pool.query(`
    SELECT 
      q.id,
      q.judul,
      q.kategori_id,
      q.kelas,
      (SELECT COUNT(*) FROM quiz_soal WHERE quiz_id = q.id) AS jumlah_soal
    FROM quiz q
    ORDER BY q.id DESC
  `);
  return rows;
};

export const getLastQuizResult = async (user_id, quiz_id) => {
  const { rows } = await pool.query(
    `SELECT *
     FROM quiz_jawaban_user
     WHERE user_id=$1 AND quiz_id=$2
     ORDER BY dikerjakan_pada DESC
     LIMIT 1`,
    [user_id, quiz_id]
  );
  return rows[0];
};
