import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createUser, findUserByWhatsapp } from "../models/userModel.js";
dotenv.config();

export const register = async (req, res) => {
  try {
    const { username, nomor_whatsapp, password, role } = req.body;

    // Validasi role
    if (!["GURU", "SISWA"].includes(role)) {
      return res.status(400).json({ message: "Role must be GURU or SISWA" });
    }

    // Cek sudah dipakai?
    const existing = await findUserByWhatsapp(nomor_whatsapp);
    if (existing) {
      return res.status(400).json({ message: "Nomor Whatsapp already used" });
    }

    // Validasi password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await createUser({
      username,
      nomor_whatsapp,
      password: hashed,
      role,
    });

    res.status(201).json({
      message: "Registered successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Register failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { nomor_whatsapp, password } = req.body;

    const user = await findUserByWhatsapp(nomor_whatsapp);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // JWT
    const token = jwt.sign(
      {
        id: user.id,
        nomor_whatsapp: user.nomor_whatsapp,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nomor_whatsapp: user.nomor_whatsapp,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // payload token → { id, nomor_whatsapp, role }
    const userId = req.user.id;

    const user = await findUserByWhatsapp(req.user.nomor_whatsapp);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Jangan kirim password
    delete user.password;

    res.json({
      message: "User profile fetched",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Get profile failed", error: err.message });
  }
};
