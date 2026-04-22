import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weeklyPlan: [
      {
        day: {
          type: String,
          required: true,
        },
        breakfast: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
        },
        lunch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
        },
        snack: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
        },
        dinner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("MealPlan", mealPlanSchema);
