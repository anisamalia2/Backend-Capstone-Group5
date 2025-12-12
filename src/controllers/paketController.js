import {
  createPaket,
  getAllPaket,
  getPaketById,
  updatePaket,
  deletePaket,
} from "../models/paketModel.js";

export const createPaketController = async (req, res, next) => {
  try {
    const { nama, harga, duration_months } = req.body;

    const paket = await createPaket(nama, harga, duration_months);

    res.status(201).json({
      message: "Paket berhasil dibuat",
      data: paket,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPaketController = async (req, res, next) => {
  try {
    const data = await getAllPaket();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const getPaketByIdController = async (req, res, next) => {
  try {
    const paket = await getPaketById(req.params.id);

    if (!paket)
      return res.status(404).json({ message: "Paket tidak ditemukan" });

    res.json({ data: paket });
  } catch (error) {
    next(error);
  }
};

export const updatePaketController = async (req, res, next) => {
  try {
    const { nama, harga, duration_months } = req.body;
    const updated = await updatePaket(
      req.params.id,
      nama,
      harga,
      duration_months
    );

    if (!updated)
      return res.status(404).json({ message: "Paket tidak ditemukan" });

    res.json({
      message: "Paket berhasil diupdate",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePaketController = async (req, res, next) => {
  try {
    await deletePaket(req.params.id);
    res.json({ message: "Paket berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
