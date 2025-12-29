import * as model from "../models/quizModel.js";

export const createQuiz = async (req, res) => {
  try {
    if (req.user.role !== "GURU")
      return res.status(403).json({ message: "Akses hanya untuk GURU" });

    const { judul, kategori_id, kelas, soal } = req.body;

    const quiz = await model.createQuiz({
      judul,
      kategori_id,
      kelas,
      guru_id: req.user.id,
    });

    for (const s of soal || []) {
      // VALIDASI khusus untuk soal tipe MCQ
      if (s.tipe === "MCQ") {
        // minimal 2 opsi
        if (!Array.isArray(s.opsi) || s.opsi.length < 2) {
          return res.status(400).json({
            message: "Soal MCQ wajib punya minimal 2 opsi",
          });
        }

        // cek struktur { key, text }
        const opsiValid = s.opsi.every((o) => o.key && o.text);
        if (!opsiValid) {
          return res.status(400).json({
            message: "Format opsi harus { key: 'A', text: '...' }",
          });
        }

        // jawaban harus dalam bentuk key (A/B/C/D)
        if (!s.jawaban || !["A", "B", "C", "D"].includes(s.jawaban)) {
          return res.status(400).json({
            message: "Jawaban MCQ harus berupa key opsi: A/B/C/D",
          });
        }
      }

      // INSERT SOAL KE DATABASE
      await model.addSoal({
        quiz_id: quiz.id,
        pertanyaan: s.pertanyaan,
        tipe: s.tipe,
        opsi: s.opsi,
        jawaban: s.jawaban,
        penjelasan: s.penjelasan,
      });
    }

    res.status(201).json({ quiz_id: quiz.id });
  } catch (err) {
    res.status(500).json({ message: "Create quiz failed", error: err.message });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const q = await model.getQuizWithSoal(req.params.id);
    if (!q) return res.status(404).json({ message: "Quiz not found" });
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: "Get quiz failed", error: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const user_id = req.user.id;
    const quiz_id = req.params.id;
    const { answers } = req.body;

    const q = await model.getQuizWithSoal(quiz_id);
    if (!q) return res.status(404).json({ message: "Quiz not found" });

    let skor = 0;
    for (const s of q.soal) {
      const ans = answers?.find((a) => a.soal_id == s.id);
      if (ans && ans.jawaban == s.jawaban) skor++;
    }

    const result = await model.saveQuizResult({
      user_id,
      quiz_id,
      skor,
      jawab_json: answers,
    });

    res.json({ message: "Quiz submitted", skor, result });
  } catch (err) {
    res.status(500).json({ message: "Submit quiz failed", error: err.message });
  }
};

export const hapusQuiz = async (req, res) => {
  try {
    await model.deleteQuiz(req.params.id, req.user.id);
    res.json({ message: "Quiz berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listQuiz = async (req, res) => {
  try {
    res.json(await model.getAllQuiz());
  } catch (err) {
    res.status(500).json({ message: "Failed to load quiz list" });
  }
};

export const getQuizResult = async (req, res) => {
  try {
    const result = await model.getLastQuizResult(req.user.id, req.params.id);
    const q = await model.getQuizWithSoal(req.params.id);

    if (!result)
      return res
        .status(404)
        .json({ message: "Belum pernah mengerjakan quiz ini" });

    const total_soal = q.soal.length;

    const detail = q.soal.map((s) => {
      const ans = result.jawab_json?.find((a) => a.soal_id == s.id);

      return {
        soal_id: s.id,
        pertanyaan: s.pertanyaan,
        opsi: s.opsi,
        jawaban_benar: s.jawaban,
        jawaban_user: ans?.jawaban || null,
        benar: ans?.jawaban === s.jawaban,
      };
    });

    res.json({
      skor: result.skor,
      total_soal,
      nilai_persen: Math.round((result.skor / total_soal) * 100),
      jawab_json: result.jawab_json,
      detail,
    });
  } catch (err) {
    res.status(500).json({ message: "Get result failed", error: err.message });
  }
};

export const pembahasanQuiz = async (req, res) => {
  try {
    const quiz = await model.getQuizWithSoal(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz tidak ditemukan" });

    const last = await model.getLastQuizResult(req.user.id, req.params.id);
    if (!last)
      return res
        .status(404)
        .json({ message: "Kamu belum mengerjakan quiz ini" });

    const pembahasan = quiz.soal.map((s, i) => {
      const ans = last.jawab_json.find((a) => a.soal_id == s.id);
      return {
        nomor: i + 1,
        pertanyaan: s.pertanyaan,
        opsi: s.opsi,
        jawaban_benar: s.jawaban,
        jawaban_user: ans?.jawaban || null,
        benar: ans && ans.jawaban == s.jawaban,
        penjelasan: s.penjelasan || "",
      };
    });

    res.json({
      judul_quiz: quiz.judul,
      total_soal: quiz.soal.length,
      pembahasan,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal memuat pembahasan", error: err.message });
  }
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
              'opsi', COALESCE(s.opsi, '[]'::jsonb),
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
