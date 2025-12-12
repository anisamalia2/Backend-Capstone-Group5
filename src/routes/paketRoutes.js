import express from "express";
import {
  createPaketController,
  getAllPaketController,
  getPaketByIdController,
  updatePaketController,
  deletePaketController,
} from "../controllers/paketController.js";

const router = express.Router();

router.post("/", createPaketController);

router.get("/", getAllPaketController);

router.get("/:id", getPaketByIdController);

router.put("/:id", updatePaketController);

router.delete("/:id", deletePaketController);

export default router;
