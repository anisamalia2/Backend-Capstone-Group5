export default function roleGuru(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "GURU")
    return res.status(403).json({ message: "Access denied: Guru only" });
  next();
}
