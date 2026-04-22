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

app.use(express.json({ limit: "8mb" }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/health-profile", healthProfileRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/food-log", foodLogRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
