import * as model from "../models/kategoriModel.js";

// CREATE KATEGORI (Guru Only)
export const createKategori = async (req, res) => {
  try {
    if (req.user.role !== "GURU")
      return res.status(403).json({ message: "Akses hanya untuk GURU" });

    const { nama } = req.body;
    if (!nama) return res.status(400).json({ message: "nama required" });
    const k = await model.createKategori(nama);

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      data: k,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error create kategori", error: err.message });
  }
};

// LIST KATEGORI (Public)
export const listKategori = async (req, res) => {
  try {
    const all = await model.getAllKategori();
    res.json(all);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error list kategori", error: err.message });
  }
};

// UPDATE KATEGORI (Guru Only)
export const editKategori = async (req, res) => {
  try {
    if (req.user.role !== "GURU")
      return res.status(403).json({ message: "Akses hanya untuk GURU" });

    const { id } = req.params;
    const { nama } = req.body;

    const kategori = await model.updateKategori(id, nama);

    if (!kategori)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });

    res.json({
      message: "Kategori berhasil diperbarui",
      data: kategori,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error update kategori", error: error.message });
  }
};

// DELETE KATEGORI (Guru Only)
export const hapusKategori = async (req, res) => {
  try {
    if (req.user.role !== "GURU")
      return res.status(403).json({ message: "Akses hanya untuk GURU" });

    const { id } = req.params;

    await model.deleteKategori(id);

    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error delete kategori", error: error.message });
  }
};
