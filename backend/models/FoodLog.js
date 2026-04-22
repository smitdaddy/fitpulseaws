import mongoose from "mongoose";

const foodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 S3 Image URL
    imageUrl: {
      type: String,
      default: null,
    },

    calories: {
      type: Number,
      default: 0,
    },

    carbs: {
      type: Number,
      default: 0,
    },

    protein: {
      type: Number,
      default: 0,
    },

    fats: {
      type: Number,
      default: 0,
    },

    sugar: {
      type: Number,
      default: 0,
    },

    mealType: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "pre-workout",
        "post-workout",
      ],
      default: "snack",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("FoodLog", foodLogSchema);
