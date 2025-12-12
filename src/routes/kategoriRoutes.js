import express from "express";
import { verifyToken } from "../middleware/auth.js";
import roleGuru from "../middleware/roleGuru.js";

import {
  createKategori,
  listKategori,
  editKategori,
  hapusKategori,
} from "../controllers/kategoriController.js";

const router = express.Router();

router.get("/", listKategori);

router.post("/", verifyToken, roleGuru, createKategori);

router.put("/:id", verifyToken, roleGuru, editKategori);

router.delete("/:id", verifyToken, roleGuru, hapusKategori);

export default router;
