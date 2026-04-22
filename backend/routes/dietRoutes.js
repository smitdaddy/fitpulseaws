import express from "express";
import { createDietPlan, getDietPlan } from "../controllers/dietController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, createDietPlan);
router.get("/", protect, getDietPlan);

export default router;
