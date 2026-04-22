import express from "express";
import {
  addFoodLog,
  analyzeFoodNutrition,
  getTodayLogs,
  getWeeklyStats,
} from "../controllers/foodLogController.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js"; // 👈 ADD THIS

const router = express.Router();

// 🔥 Order matters: protect → upload → controller

// Analyze food (with optional image)
router.post(
  "/analyze",
  protect,
  upload.single("image"), // 👈 add this
  analyzeFoodNutrition
);

// Add food log (with optional image)
router.post(
  "/",
  protect,
  upload.single("image"), // 👈 add this
  addFoodLog
);

// Get logs
router.get("/today", protect, getTodayLogs);
router.get("/weekly", protect, getWeeklyStats);

export default router;
