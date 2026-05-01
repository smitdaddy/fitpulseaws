import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import healthProfileRoutes from "./routes/healthProfileRoutes.js";
import dietRoutes from "./routes/dietRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import foodLogRoutes from "./routes/foodLogRoutes.js";

dotenv.config();

const app = express();

// ✅ CORS FIX — explicit headers for CloudFront mobile compatibility
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  // Respond immediately to OPTIONS preflight without hitting routes
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "8mb" }));

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/health-profile", healthProfileRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/food-log", foodLogRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("FitPulse API is LIVE 🚀");
});

// Always LAST - Global 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
