const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 10) / 10 : 0;
};

const extractJson = (text) => {
  if (!text) {
    throw new Error("Gemini returned an empty nutrition response");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Gemini did not return nutrition data in JSON format");
    }
    return JSON.parse(match[0]);
  }
};

export const estimateNutrition = async ({ foodName, image }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const prompt = [
    "Estimate the nutrition for the food item or meal in a typical visible/mentioned serving.",
    "Return only JSON with this exact shape:",
    '{"foodName":"string","servingSize":"string","calories":number,"protein":number,"carbs":number,"fats":number,"sugar":number,"confidence":number,"notes":"string"}',
    "Use grams for protein, carbs, fats, and sugar. Use kcal for calories.",
    "If an image is provided, identify the food from the image. If text is provided, use it as the food description.",
    foodName ? `Food description: ${foodName}` : ""
  ].filter(Boolean).join("\n");

  const parts = [{ text: prompt }];

  if (image?.data && image?.mimeType) {
    parts.push({
      inline_data: {
        mime_type: image.mimeType,
        data: image.data
      }
    });
  }

  const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            foodName: { type: "STRING" },
            servingSize: { type: "STRING" },
            calories: { type: "NUMBER" },
            protein: { type: "NUMBER" },
            carbs: { type: "NUMBER" },
            fats: { type: "NUMBER" },
            sugar: { type: "NUMBER" },
            confidence: { type: "NUMBER" },
            notes: { type: "STRING" }
          },
          required: ["foodName", "servingSize", "calories", "protein", "carbs", "fats", "sugar", "confidence", "notes"]
        }
      }
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || "Gemini nutrition lookup failed";
    throw new Error(message);
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  const nutrition = extractJson(text);

  return {
    foodName: String(nutrition.foodName || foodName || "Food").trim(),
    servingSize: String(nutrition.servingSize || "Estimated serving").trim(),
    calories: toNumber(nutrition.calories),
    protein: toNumber(nutrition.protein),
    carbs: toNumber(nutrition.carbs),
    fats: toNumber(nutrition.fats),
    sugar: toNumber(nutrition.sugar),
    confidence: Math.min(1, Math.max(0, Number(nutrition.confidence) || 0)),
    notes: String(nutrition.notes || "Nutrition values are AI estimates.").trim()
  };
};
