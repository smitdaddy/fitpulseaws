import Medication from "../models/Medication.js";
import { sendNotification } from "../services/snsService.js";

// @desc    Get all active medications for user
// @route   GET /api/medications
// @access  Private
export const getMedications = async (req, res) => {
  try {
    const meds = await Medication.find({
      user: req.user._id,
      isActive: true,
    }).sort({ time: 1 });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a medication
// @route   POST /api/medications
// @access  Private
export const addMedication = async (req, res) => {
  try {
    const { medicineName, dosage, time, frequency, startDate, endDate } =
      req.body;

    const med = await Medication.create({
      user: req.user._id,
      medicineName,
      dosage,
      time,
      frequency: frequency || "daily",
      startDate,
      endDate,
    });

    // 🔥 SNS Notification (ADD THIS)
    await sendNotification(
      `New medication added: ${medicineName} at ${time}`,
      "Medication Reminder"
    );

    res.status(201).json(med);
  } catch (error) {
    console.error("Add Medication Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle taken status for a specific date
// @route   PUT /api/medications/:id/toggle
// @access  Private
export const toggleMedicationStatus = async (req, res) => {
  try {
    const { date } = req.body;
    const med = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!med) {
      return res.status(404).json({ message: "Medication not found" });
    }

    // Toggle logic: If the date is already in the array, remove it. If not, add it.
    if (!med.takenDates) med.takenDates = [];
    const index = med.takenDates.indexOf(date);
    if (index === -1) {
  med.takenDates.push(date);

  // 🔥 Notify when taken
  await sendNotification(
    `Medication taken: ${med.medicineName} on ${date}`,
    "Medication Update"
  );

} else {
  med.takenDates.splice(index, 1);
}
    await med.save();
    res.json(med);
  } catch (error) {
    console.error("Toggle Medication Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete or deactivate medication
// @route   DELETE /api/medications/:id
// @access  Private
export const deleteMedication = async (req, res) => {
  try {
    const med = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!med) {
      return res.status(404).json({ message: "Medication not found" });
    }

    med.isActive = false;
    await med.save();
    res.json({ message: "Medication removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
