import express from "express";
import { verifyToken } from "../middleware/auth.js";
import roleGuru from "../middleware/roleGuru.js";
import {
  createPaketController,
  getAllPaketController,
  getPaketByIdController,
  updatePaketController,
  deletePaketController,
} from "../controllers/paketController.js";

const router = express.Router();

router.post("/", verifyToken, roleGuru, createPaketController);

router.get("/", getAllPaketController);

router.get("/:id", getPaketByIdController);

router.put("/:id", verifyToken, roleGuru, updatePaketController);

router.delete("/:id", verifyToken, roleGuru, deletePaketController);

export default router;
