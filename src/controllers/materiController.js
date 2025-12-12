import slugify from "slugify";
import * as model from "../models/materiModel.js";
import { updateMateriById, deleteMateriById } from "../models/materiModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

//   CREATE MATERI  Mendukung 3 tipe: 1. FILE (video, pdf, ppt), 2. LINK YouTube, 3. TEXT ONLY
export const createMateri = async (req, res) => {
  try {
    const { judul, konten, deskripsi, tipe, kategori_id, durasi, kelas } =
      req.body;

    let file_url = null;

    // Upload file jika tipe file
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

    const slug = slugify(judul, { lower: true, strict: true });

    const created = await model.createMateri({
      judul,
      konten,
      file_url,
      guru_id: req.user.id,
      slug,
      deskripsi,
      tipe,
      kategori_id,
      durasi,
      kelas,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({
      message: "Create materi failed",
      error: err.message,
    });
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
