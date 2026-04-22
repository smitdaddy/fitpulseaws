import FoodLog from "../models/FoodLog.js";
import { estimateNutrition } from "../services/geminiNutritionService.js";
import { uploadToS3 } from "../services/s3Service.js";
import fs from "fs";

// @desc    Estimate food nutrition with Gemini
// @route   POST /api/food-log/analyze
// @access  Private
export const analyzeFoodNutrition = async (req, res) => {
  try {
    console.log("---- ANALYZE START ----");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { foodName } = req.body;

    let image = null;

    if (req.file) {
      // Read file into base64 string for Gemini API BEFORE uploadToS3 deletes it
      const fileBuffer = await fs.promises.readFile(req.file.path);
      const base64Data = fileBuffer.toString("base64");

      console.log("📤 Uploading image for analysis to S3...");
      const imageUrl = await uploadToS3(req.file);
      console.log("✅ Uploaded image URL:", imageUrl);

      image = { 
        url: imageUrl,
        data: base64Data,
        mimeType: req.file.mimetype
      };
    } else {
      console.log("❌ No file received in analyze");
    }

    if (!foodName?.trim() && !image) {
      return res.status(400).json({
        message: "Enter a food name or upload a food image",
      });
    }

    const nutrition = await estimateNutrition({
      foodName: foodName?.trim(),
      image,
    });

    console.log("✅ Gemini response:", nutrition);

    res.json(nutrition);
  } catch (error) {
    console.error("❌ Analyze Error:", error);
    res.status(502).json({ message: error.message });
  }
};

// @desc    Add a food log
// @route   POST /api/food-log
// @access  Private
export const addFoodLog = async (req, res) => {
  try {
    console.log("---- ADD FOOD LOG START ----");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { foodName, calories, carbs, protein, fats, mealType } = req.body;

    let imageUrl = null;

    if (req.file) {
      console.log("📤 Uploading to S3...");
      imageUrl = await uploadToS3(req.file);
      console.log("✅ Uploaded URL:", imageUrl);
    } else {
      console.log("❌ No file received in addFoodLog");
    }

    const log = await FoodLog.create({
      user: req.user._id,
      foodName,
      calories: Number(calories) || 0,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
      fats: Number(fats) || 0,
      mealType: mealType || "snack",
      imageUrl: imageUrl,
    });

    console.log("✅ Saved to DB:", log);

    res.status(201).json(log);
  } catch (error) {
    console.error("❌ Add FoodLog Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get today's food logs
export const getTodayLogs = async (req, res) => {
  try {
    console.log("---- GET TODAY LOGS ----");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
      user: req.user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    console.log("✅ Logs fetched:", logs.length);

    res.json(logs);
  } catch (error) {
    console.error("❌ Today Logs Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Weekly stats
export const getWeeklyStats = async (req, res) => {
  try {
    console.log("---- GET WEEKLY STATS ----");

    const today = new Date();
    const lastWeek = new Date();

    lastWeek.setDate(lastWeek.getDate() - 6);
    lastWeek.setHours(0, 0, 0, 0);

    const logs = await FoodLog.find({
      user: req.user._id,
      createdAt: { $gte: lastWeek, $lte: today },
    });

    console.log("✅ Logs found:", logs.length);

    const dailyData = Array(7)
      .fill()
      .map((_, i) => {
        const d = new Date(lastWeek);
        d.setDate(d.getDate() + i);

        return {
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`,
          calories: 0,
          protein: 0,
        };
      });

    logs.forEach((log) => {
      const d = log.createdAt;

      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;

      const dayMatch = dailyData.find((dd) => dd.date === dateStr);

      if (dayMatch) {
        dayMatch.calories += log.calories || 0;
        dayMatch.protein += log.protein || 0;
      }
    });

    console.log("✅ Weekly data ready");

    res.json(dailyData);
  } catch (error) {
    console.error("❌ Weekly Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};
