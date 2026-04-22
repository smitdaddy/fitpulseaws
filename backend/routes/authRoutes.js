import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  googleAuth,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
