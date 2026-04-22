import HealthProfile from "../models/HealthProfile.js";
import MealPlan from "../models/MealPlan.js";
import { generateDietPlan } from "../services/dietService.js";

export const createDietPlan = async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(400).json({
        message: "Create health profile first",
      });
    }

    // ✅ get weeklyPlan
    const { weeklyPlan } = await generateDietPlan(profile);

    // ✅ store weeklyPlan
    const mealPlan = await MealPlan.create({
      user: req.user._id,
      weeklyPlan,
    });

    // ✅ populate meals
    const populatedPlan = await MealPlan.findById(mealPlan._id)
      .populate("weeklyPlan.breakfast")
      .populate("weeklyPlan.lunch")
      .populate("weeklyPlan.snack")
      .populate("weeklyPlan.dinner");

    res.json(populatedPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDietPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("weeklyPlan.breakfast")
      .populate("weeklyPlan.lunch")
      .populate("weeklyPlan.snack")
      .populate("weeklyPlan.dinner");

    if (!mealPlan) {
      return res.status(404).json({ message: "No diet plan found" });
    }

    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
