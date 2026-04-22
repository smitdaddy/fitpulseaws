import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  region: {
    type: String,
    enum: ["north_india", "south_india", "west_india", "east_india"],
  },

  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snack"],
  },

  condition: {
    type: String,
    enum: ["diabetes", "pcos"],
  },

  dietaryPreference: {
    type: String,
    enum: ["vegetarian", "non-vegetarian", "vegan"],
  },

  calories: Number,
  carbs: Number,
  protein: Number,

  recipe: String,
});

export default mongoose.model("Meal", mealSchema);
