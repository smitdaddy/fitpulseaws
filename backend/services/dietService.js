import Meal from "../models/Meal.js";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const extractJson = (text) => {
  if (!text) throw new Error("Gemini returned an empty response");
  try { return JSON.parse(text); }
  catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) throw new Error("Gemini did not return valid JSON");
    return JSON.parse(match[0]);
  }
};

export const generateDietPlan = async (profile) => {
  const { region, condition, dietaryPreference, fitnessGoal, dailyCalorieGoal, dailyProteinGoal } = profile;
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) throw new Error("Gemini API key is not configured");

  const prompt = `You are a professional fitness nutritionist. Create a 7-day personalized diet plan.
User Health Profile:
- Dietary Preference: ${dietaryPreference || "None"}
- Region: ${region || "None"}
- Condition: ${condition || "None"}
- Fitness Goal: ${fitnessGoal || "None"}
- Daily Calorie Target: ${dailyCalorieGoal || "2000"} kcal
- Daily Protein Target: ${dailyProteinGoal || "100"} grams

Return strictly a JSON object with a single "weeklyPlan" array. The array must contain exactly 7 objects, one for each day.
Each day object must have these exactly named keys:
"day": (String, e.g. "Monday", "Tuesday")
"breakfast": a Meal object
"lunch": a Meal object
"snack": a Meal object
"dinner": a Meal object

A Meal object must have these exactly named keys:
"name": (String) The name of the meal
"calories": (Number) Total calories for this meal
"protein": (Number) Protein in grams
"carbs": (Number) Carbohydrates in grams
"recipe": (String) A short 1-sentence description or recipe instruction.

The sum of calories from breakfast, lunch, snack, and dinner for a given day must closely equal the Daily Calorie Target. The sum of protein must closely equal the Daily Protein Target. Do not wrap the JSON in Markdown formatting blocks if possible, just return raw JSON string.`;

  const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || "Gemini diet generation failed";
    throw new Error(message);
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  const generatedData = extractJson(text);
  if (!generatedData.weeklyPlan || !Array.isArray(generatedData.weeklyPlan)) {
      throw new Error("Invalid output structure from Gemini API");
  }

  // Iterate over weeklyPlan and save meals
  const mappedWeeklyPlan = [];
  
  for (const daily of generatedData.weeklyPlan) {
    const dayPlan = { day: daily.day };
    
    // Save each meal to the DB
    for (const mealType of ["breakfast", "lunch", "snack", "dinner"]) {
      // Gemini can easily capitalize the fields unpredictably (e.g. "Breakfast" vs "breakfast").
      const mealData = daily[mealType] || daily[mealType.charAt(0).toUpperCase() + mealType.slice(1)];
      
      if (mealData) {
        const mealDoc = await Meal.create({
          name: mealData.name || `Custom ${mealType}`,
          region: profile.region,
          mealType: mealType,
          condition: profile.condition,
          dietaryPreference: profile.dietaryPreference,
          calories: mealData.calories || 0,
          carbs: mealData.carbs || 0,
          protein: mealData.protein || 0,
          recipe: mealData.recipe || ""
        });
        
        dayPlan[mealType] = mealDoc._id;
      } else {
        dayPlan[mealType] = null;
      }
    }
    
    mappedWeeklyPlan.push(dayPlan);
  }

  return { weeklyPlan: mappedWeeklyPlan };
};
