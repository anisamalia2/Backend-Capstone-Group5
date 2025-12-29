import pool from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const [usersRes, materiRes, revenueRes] = await Promise.all([
      pool.query(
        "SELECT COUNT(*)::int AS total_siswa FROM users WHERE role = 'SISWA'"
      ),
      pool.query("SELECT COUNT(*)::int AS total_materi FROM materi"),
      pool.query(
        "SELECT COALESCE(SUM(total),0)::numeric AS total_revenue FROM payments WHERE status = 'paid'"
      ),
    ]);

    const total_siswa = usersRes.rows[0].total_siswa;
    const total_materi = materiRes.rows[0].total_materi;
    const total_revenue = revenueRes.rows[0].total_revenue;

    res.json({ total_siswa, total_materi, total_revenue });
  } catch (err) {
    console.error("Get stats failed", err.message);
    res.status(500).json({ message: "Get stats failed", error: err.message });
  }
};
