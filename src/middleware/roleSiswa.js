export default function roleSiswa(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "SISWA")
    return res.status(403).json({ message: "Access denied: Siswa only" });
  next();
}
