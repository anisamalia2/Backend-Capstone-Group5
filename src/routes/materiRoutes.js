import express from "express";
import { verifyToken } from "../middleware/auth.js";
import roleGuru from "../middleware/roleGuru.js";
import upload from "../middleware/upload.js";

import {
  createMateri,
  listMateri,
  getMateri,
  updateMateri,
  deleteMateri,
} from "../controllers/materiController.js";

const router = express.Router();

// LIST semua materi
router.get("/", listMateri);

// DETAIL materi
router.get("/:id", getMateri);

// CREATE materi (Guru Only)
router.post("/", verifyToken, roleGuru, upload.single("file"), createMateri);

// UPDATE materi (Guru Only)
router.put("/:id", verifyToken, roleGuru, upload.single("file"), updateMateri);

// DELETE materi (Guru Only)
router.delete("/:id", verifyToken, roleGuru, deleteMateri);

export default router;
