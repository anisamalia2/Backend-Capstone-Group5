import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "../src/routes/authRoutes.js";
import userRoutes from "../src/routes/userRoutes.js";
import kategoriRoutes from "../src/routes/kategoriRoutes.js";
import materiRoutes from "../src/routes/materiRoutes.js";
import quizRoutes from "../src/routes/quizRoutes.js";
import { errorHandler } from "../src/middleware/errorHandler.js";
import paymentRoutes from "../src/routes/paymentRoutes.js";
import paketRoutes from "../src/routes/paketRoutes.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/materi", materiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/paket", paketRoutes);

app.use(errorHandler);

export default app;
