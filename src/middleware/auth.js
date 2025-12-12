import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    const header = req.headers["authorization"] || req.headers["Authorization"];
    if (!header) return res.status(401).json({ message: "Token missing" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing" });

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return res.status(401).json({ message: "Invalid token" });

      // payload = { id, nomor_whatsapp, role }
      req.user = payload;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: "Auth error", error: err.message });
  }
};
