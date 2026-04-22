import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import FoodScannerPage from "./pages/FoodScannerPage";
import HealthAnalyticsPage from "./pages/HealthAnalyticsPage";
import MedicationTrackerPage from "./pages/MedicationTrackerPage";
import DietPlanPage from "./pages/DietPlanPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/food-scanner" element={<FoodScannerPage />} />
        <Route path="/health-analytics" element={<HealthAnalyticsPage />} />
        <Route path="/medication" element={<MedicationTrackerPage />} />
        <Route path="/diet-plan" element={<DietPlanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
