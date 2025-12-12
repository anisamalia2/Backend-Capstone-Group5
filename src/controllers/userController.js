import pool from "../config/db.js";
import {
  findUserById,
  updateUserProfile,
  saveAvatar,
} from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const getProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await findUserById(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Get profile failed", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const { name, kelas } = req.body;
    // hanya perbarui field yang diberikan, tidak mereset avatar
    const updated = await updateUserProfile(id, { name, kelas });
    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Update profile failed", error: err.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "avatars" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    const result = await uploadStream();
    await saveAvatar(req.user.id, result.secure_url);
    res.json({ message: "Avatar uploaded", url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, nomor_whatsapp, role, avatar_url, created_at FROM users ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get users", error: err.message });
  }
};
