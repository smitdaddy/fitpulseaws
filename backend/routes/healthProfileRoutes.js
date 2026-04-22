import express from "express";
import {
  createHealthProfile,
  getHealthProfile,
} from "../controllers/healthProfileController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createHealthProfile);
router.get("/", protect, getHealthProfile);

export default router;
