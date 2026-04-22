import mongoose from "mongoose";

const healthProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    condition: {
      type: String,
      enum: ["diabetes", "pcos"],
      required: true,
    },

    height: {
      type: Number,
    },

    weight: {
      type: Number,
    },

    activityLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
    },

    bloodSugarLevel: {
      type: Number,
    },

    dietaryPreference: {
      type: String,
      enum: ["vegetarian", "non-vegetarian", "vegan"],
    },

    region: {
      type: String,
      enum: ["north_india", "south_india", "west_india", "east_india"],
    },

    fitnessGoal: {
      type: String,
      enum: ["maintain", "fat_loss", "weight_gain"],
    },

    dailyCalorieGoal: {
      type: Number,
    },

    dailyProteinGoal: {
      type: Number,
    },

    allergies: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HealthProfile", healthProfileSchema);
