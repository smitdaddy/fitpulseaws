import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medicineName: {
      type: String,
      required: true,
    },

    dosage: {
      type: String,
    },

    time: {
      type: String,
      required: true,
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly"],
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    takenDates: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Medication", medicationSchema);
