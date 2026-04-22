import express from "express";
import {
  getMedications,
  addMedication,
  toggleMedicationStatus,
  deleteMedication,
} from "../controllers/medicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getMedications).post(protect, addMedication);

router.put("/:id/toggle", protect, toggleMedicationStatus);
router.delete("/:id", protect, deleteMedication);

export default router;
