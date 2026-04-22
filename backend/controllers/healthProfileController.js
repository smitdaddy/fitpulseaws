import HealthProfile from "../models/HealthProfile.js";
import User from "../models/User.js";

export const createHealthProfile = async (req, res) => {
  try {
    const { weight, height, activityLevel, fitnessGoal } = req.body;
    let computedCalories = undefined;
    let computedProtein = undefined;

    if (weight) {
      computedProtein = Math.round(weight * 1.6); // Base protein 1.6g/kg

      if (height || req.user._id) { 
        const userObj = await User.findById(req.user._id);
        if (userObj && userObj.age && userObj.gender && height) {
           let bmr = 10 * weight + 6.25 * height - 5 * userObj.age;
           bmr += userObj.gender === "female" ? -161 : 5;

           let multiplier = 1.2;
           if (activityLevel === "moderate") multiplier = 1.55;
           if (activityLevel === "high") multiplier = 1.75;

           let tdee = bmr * multiplier;
           
           if (fitnessGoal === "fat_loss") {
             computedCalories = tdee - 500;
             computedProtein = Math.round(weight * 2.0); // Higher protein for fat loss preserves muscle
           } else if (fitnessGoal === "weight_gain") {
             computedCalories = tdee + 500;
             computedProtein = Math.round(weight * 1.8);
           } else {
             computedCalories = tdee;
           }
           computedCalories = Math.round(computedCalories);
        }
      }
    }

    const updateData = { ...req.body, user: req.user._id };
    if (computedCalories !== undefined) updateData.dailyCalorieGoal = computedCalories;
    if (computedProtein !== undefined) updateData.dailyProteinGoal = computedProtein;

    // Upsert: one health profile per user
    const profile = await HealthProfile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthProfile = async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({
      user: req.user._id,
    });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
