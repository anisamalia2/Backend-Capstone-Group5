import slugify from "slugify";
import * as model from "../models/materiModel.js";
import { updateMateriById, deleteMateriById } from "../models/materiModel.js";
import { getUserPremiumUntilById } from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import pool from "../config/db.js";

//   CREATE MATERI  Mendukung 3 tipe: 1. FILE (video, pdf, ppt), 2. LINK YouTube, 3. TEXT ONLY
export const createMateri = async (req, res) => {
  try {
    const { judul, konten, deskripsi, tipe, kategori_id, durasi, kelas } =
      req.body || {};

    // Basic validation
    if (!judul || !tipe) {
      return res.status(400).json({
        message: "Field 'judul' and 'tipe' are required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Parse is_premium reliably (default false)
    const rawIsPremium =
      req.body && typeof req.body.is_premium !== "undefined"
        ? req.body.is_premium
        : false;
    const is_premium =
      typeof rawIsPremium === "boolean"
        ? rawIsPremium
        : rawIsPremium === "true" || rawIsPremium === "1" || rawIsPremium === 1;

    let file_url = null;

    // Upload file jika ada
    if (req.file) {
      try {
        const uploadStream = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "materi" },
              (err, result) => (err ? reject(err) : resolve(result))
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });

        const result = await uploadStream();
        file_url = result && result.secure_url ? result.secure_url : null;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          message: "File upload failed",
          error: uploadErr.message || String(uploadErr),
        });
      }
    }

    // Create a unique slug (append counter if needed)
    const baseSlug = slugify(judul, { lower: true, strict: true }) || "materi";
    let slug = baseSlug;
    let counter = 1;
    try {
      let exists = await pool.query("SELECT 1 FROM materi WHERE slug = $1", [
        slug,
      ]);
      while (exists.rows && exists.rows.length > 0) {
        slug = `${baseSlug}-${counter++}`;
        exists = await pool.query("SELECT 1 FROM materi WHERE slug = $1", [
          slug,
        ]);
      }
    } catch (dbErr) {
      console.error("DB error when checking slug uniqueness:", dbErr);
      return res
        .status(500)
        .json({ message: "Database error", error: dbErr.message });
    }

    // Build payload and persist
    const payload = {
      judul,
      konten,
      file_url,
      guru_id: req.user.id,
      slug,
      deskripsi: deskripsi || null,
      tipe,
      kategori_id: kategori_id || null,
      durasi: durasi || null,
      kelas: kelas || null,
      is_premium: !!is_premium,
    };

    const created = await model.createMateri(payload);

    return res.status(201).json(created);
  } catch (err) {
    console.error("Create materi failed:", err);
    return res
      .status(500)
      .json({ message: "Create materi failed", error: err.message });
  }
};

//  GET DETAIL MATERI
export const getMateri = async (req, res) => {
  try {
    const { id } = req.params;
    const materi = await model.getMateriById(id);

    if (!materi) {
      return res.status(404).json({ message: "Materi not found" });
    }

    // If materi is premium, enforce access for non-GURU users
    if (materi.is_premium && req.user?.role !== "GURU") {
      const userPremium = await getUserPremiumUntilById(req.user.id);
      const premiumUntil = userPremium ? userPremium.premium_until : null;

      if (!premiumUntil || new Date(premiumUntil) <= new Date()) {
        return res
          .status(403)
          .json({
            message:
              "Akses materi premium: berlangganan diperlukan atau sudah kadaluarsa",
          });
      }
    }

    res.json(materi);
  } catch (err) {
    res.status(500).json({
      message: "Get materi failed",
      error: err.message,
    });
  }
};

//  LIST MATERI + SEARCH
export const listMateri = async (req, res) => {
  try {
    const { q, kategori } = req.query;

    const list = await model.listMateri({
      q: q || null,
      kategori_id: kategori || null,
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({
      message: "List materi failed",
      error: err.message,
    });
  }
};

//  UPDATE MATERI
export const updateMateri = async (req, res) => {
  try {
    if (req.user.role !== "GURU")
      return res.status(403).json({ message: "Akses hanya untuk GURU" });

    const { id } = req.params;
    const { judul, konten, deskripsi, tipe, kategori_id, durasi, kelas } =
      req.body;

    let file_url = null;

    if (req.file) {
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "materi" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await uploadStream();
      file_url = result.secure_url;
    }

    const materi = await updateMateriById(
      id,
      req.user.id,
      judul,
      konten,
      file_url,
      deskripsi,
      tipe,
      kategori_id,
      durasi,
      kelas
    );

    if (!materi) {
      return res.status(404).json({
        message: "Materi tidak ditemukan atau bukan milik Anda",
      });
    }

    res.json({
      message: "Materi berhasil diperbarui",
      materi,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error update materi",
      error: error.message,
    });
  }
};

//  DELETE MATERI
export const deleteMateri = async (req, res) => {
  try {
    if (req.user.role !== "GURU")
      return res.status(403).json({ message: "Akses hanya untuk GURU" });

    const { id } = req.params;

    await deleteMateriById(id, req.user.id);

    res.json({ message: "Materi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      message: "Error delete materi",
      error: error.message,
    });
  }
};
