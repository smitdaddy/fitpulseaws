import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [dietPlan, setDietPlan] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date Logic
  const getTodayIndex = () => {
    const day = new Date().getDay(); // 0 = Sunday
    return day === 0 ? 6 : day - 1; // 0 = Mon, 6 = Sun
  };
  const todayIndex = getTodayIndex();

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const todayStr = getTodayString();

  useEffect(() => {
    const token = localStorage.getItem("fitpulse_token");
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch User and Profile
        const userRes = await fetch("https://d36bbfu262j7b7.cloudfront.net/api/auth/profile", { headers });
        if (userRes.ok) setUser(await userRes.json());
        else {
          navigate("/signin");
          return;
        }

        const profileRes = await fetch("https://d36bbfu262j7b7.cloudfront.net/api/health-profile", { headers });
        if (profileRes.ok) setHealthProfile(await profileRes.json());

        // Parallel Fetch Dashboard Data
        const [logsRes, dietRes, medsRes] = await Promise.all([
          fetch("https://d36bbfu262j7b7.cloudfront.net/api/food-log/today", { headers }),
          fetch("https://d36bbfu262j7b7.cloudfront.net/api/diet", { headers }),
          fetch("https://d36bbfu262j7b7.cloudfront.net/api/medications", { headers }),
        ]);

        if (logsRes.ok) setTodayLogs(await logsRes.json());
        if (dietRes.ok) setDietPlan(await dietRes.json());
        if (medsRes.ok) setMedications(await medsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleToggleMed = async (id) => {
    const token = localStorage.getItem("fitpulse_token");
    try {
      const res = await fetch(`https://d36bbfu262j7b7.cloudfront.net/api/medications/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: todayStr }),
      });
      const data = await res.json();
      if (res.ok) {
        setMedications((meds) => meds.map((m) => (m._id === id ? data : m)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark flex items-center justify-center h-screen text-slate-700 dark:text-slate-200">
        <p className="text-sm font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  // Dashboard Aggregations
  const totalCalories = todayLogs.reduce(
    (sum, log) => sum + (log.calories || 0),
    0
  );
  const totalProtein = todayLogs.reduce(
    (sum, log) => sum + (log.protein || 0),
    0
  );
  const totalCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFats = todayLogs.reduce((sum, log) => sum + (log.fats || 0), 0);
  const mealsLogged = todayLogs.length;

  const targetCalories = healthProfile?.tdee || 2000;
  const targetProtein = Math.round((targetCalories * 0.3) / 4); // basic 30% macro

  // SVG Pie Chart Logic (Circumference ~ 502)
  const totalMacros = totalProtein + totalCarbs + totalFats;
  const proteinPct = totalMacros ? totalProtein / totalMacros : 0;
  const carbsPct = totalMacros ? totalCarbs / totalMacros : 0;
  const fatsPct = totalMacros ? totalFats / totalMacros : 0;

  const circum = 502;
  const proteinLen = proteinPct * circum;
  const carbsLen = carbsPct * circum;
  const fatsLen = fatsPct * circum;

  const proteinOffset = 0;
  const carbsOffset = -proteinLen;
  const fatsOffset = -(proteinLen + carbsLen);

  const healthScore = totalCalories
    ? Math.min(100, Math.round((totalCalories / targetCalories) * 100))
    : 0;

  const todayDiet = dietPlan?.weeklyPlan?.[todayIndex];
  const upcomingMed = medications.find(
    (m) => !m.takenDates?.includes(todayStr) && m.isActive !== false
  );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-xl">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
                  placeholder="Search foods, exercises, or tips..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-500 hover:text-primary transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <span className="material-symbols-outlined">notifications</span>
                {upcomingMed && (
                  <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">
                    {user?.name || user?.email || "Your profile"}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  )}
                </div>
                <div
                  className="size-10 rounded-full bg-cover bg-center border-2 border-primary/20"
                  title="Profile Photo"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrEoNjSkTFeFr013Fsnt3aKnxPipC-2Bkc8e30DUij30TthLAL96IKATENtch1rmdalLiHmwmeqKABeQ4rL2rDeJDTXBJCrB8nOSBGKeZsSJ3wI3tPbM6cwyby7th2o9bRMBpKN5D6DR6O3CouJJ2VzZcLaHzUH_bjbEzhyTE-nfuYzcqVhoVBRVdjryclIUtGZ5GfYAS8dGvQ9sP1leW2bUIJQ368LcVQo94d7SfFUf2nbwQLkBlArONhIddXWzzMQoi4Cds9fO9l')",
                  }}
                ></div>
              </div>
            </div>
          </header>

          {/* Dashboard Body */}
          <div className="px-8 py-6 max-w-7xl mx-auto w-full space-y-8">
            {/* Welcome Section */}
            <section className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  Welcome back,{" "}
                  {user?.name || user?.email?.split("@")[0] || "Athlete"}! 👋
                </h2>
                <p className="text-slate-500 mt-1">
                  {healthProfile
                    ? `Profile: ${
                        healthProfile.age
                          ? `${healthProfile.age} years old`
                          : ""
                      }${
                        healthProfile.age && healthProfile.gender ? " • " : ""
                      }${healthProfile.gender ? healthProfile.gender : ""}`
                    : "You're all set to track today's meals, workouts, and progress."}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/health-analytics"
                  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                >
                  View Reports
                </Link>
                <Link
                  to="/health-analytics"
                  className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add</span>
                  Log Meal
                </Link>
              </div>
            </section>

            {/* Health Overview Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <span className="material-symbols-outlined">
                      local_fire_department
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Today
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Today's Calories
                </p>
                <h3 className="text-2xl font-black mt-1">
                  {totalCalories}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    / {healthProfile ? targetCalories : "..."}
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {totalCalories > 0
                    ? "You're actively tracking your meals!"
                    : "Start logging meals to see your calorie progress."}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <span className="material-symbols-outlined">
                      fitness_center
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Today
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Protein Intake
                </p>
                <h3 className="text-2xl font-black mt-1">
                  {totalProtein}g{" "}
                  <span className="text-sm font-normal text-slate-400">
                    / {healthProfile ? targetProtein + "g" : "..."}
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {totalProtein > 0
                    ? "You're hitting your macronutrients."
                    : "Your macros will update as you log food."}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <span className="material-symbols-outlined">
                      restaurant
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Logs
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Meals Logged
                </p>
                <h3 className="text-2xl font-black mt-1">
                  {mealsLogged}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    Meals
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {mealsLogged > 0
                    ? "Great job capturing your data!"
                    : "Log your first meal to start tracking."}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <span className="material-symbols-outlined">favorite</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Baseline
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Diet Adherence
                </p>
                <h3 className="text-2xl font-black mt-1">
                  {healthScore}
                  <span className="text-sm font-normal text-slate-400">%</span>
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {healthScore > 0
                    ? "You're on track to hit your daily requirement."
                    : "As you log activity, this score will grow."}
                </p>
              </div>
            </section>

            {/* Middle Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
              {/* Nutrition Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mt-2">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Nutrition Breakdown</h3>
                    <select className="text-sm border-none bg-slate-50 dark:bg-slate-800 rounded-lg py-1 px-3">
                      <option>Today</option>
                    </select>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative size-48 shrink-0">
                      {/* SVG Donut Chart */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          className="dark:stroke-slate-800"
                          cx="96"
                          cy="96"
                          fill="transparent"
                          r="80"
                          stroke="#f1f5f9"
                          strokeWidth="24"
                        ></circle>
                        {totalMacros > 0 && (
                          <>
                            <circle
                              cx="96"
                              cy="96"
                              fill="transparent"
                              r="80"
                              stroke="#21c45d"
                              strokeDasharray={`${proteinLen} ${
                                circum - proteinLen
                              }`}
                              strokeDashoffset={proteinOffset}
                              strokeWidth="24"
                              strokeLinecap="round"
                            ></circle>
                            <circle
                              cx="96"
                              cy="96"
                              fill="transparent"
                              r="80"
                              stroke="#3b82f6"
                              strokeDasharray={`${carbsLen} ${
                                circum - carbsLen
                              }`}
                              strokeDashoffset={carbsOffset}
                              strokeWidth="24"
                              strokeLinecap="round"
                            ></circle>
                            <circle
                              cx="96"
                              cy="96"
                              fill="transparent"
                              r="80"
                              stroke="#f59e0b"
                              strokeDasharray={`${fatsLen} ${circum - fatsLen}`}
                              strokeDashoffset={fatsOffset}
                              strokeWidth="24"
                              strokeLinecap="round"
                            ></circle>
                          </>
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black">
                          {totalCalories}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Total Kcal
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-primary"></span>
                          <span className="text-sm font-medium text-slate-500">
                            Protein
                          </span>
                        </div>
                        <p className="text-xl font-bold">
                          {totalProtein}g ({Math.round(proteinPct * 100)}%)
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500"></span>
                          <span className="text-sm font-medium text-slate-500">
                            Carbs
                          </span>
                        </div>
                        <p className="text-xl font-bold">
                          {totalCarbs}g ({Math.round(carbsPct * 100)}%)
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-orange-500"></span>
                          <span className="text-sm font-medium text-slate-500">
                            Fats
                          </span>
                        </div>
                        <p className="text-xl font-bold">
                          {totalFats}g ({Math.round(fatsPct * 100)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary transition-all group cursor-not-allowed opacity-50">
                    <span className="material-symbols-outlined !text-3xl text-primary group-hover:scale-110 transition-transform">
                      camera_alt
                    </span>
                    <span className="text-xs font-bold mt-2 text-slate-600 dark:text-slate-400">
                      Scan Food
                    </span>
                  </button>
                  <Link
                    to="/health-analytics"
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary transition-all group"
                  >
                    <span className="material-symbols-outlined !text-3xl text-primary group-hover:scale-110 transition-transform">
                      add_circle
                    </span>
                    <span className="text-xs font-bold mt-2 text-slate-600 dark:text-slate-400">
                      Log Meal
                    </span>
                  </Link>
                  <Link
                    to="/diet-plan"
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary transition-all group"
                  >
                    <span className="material-symbols-outlined !text-3xl text-primary group-hover:scale-110 transition-transform">
                      description
                    </span>
                    <span className="text-xs font-bold mt-2 text-slate-600 dark:text-slate-400">
                      Plan
                    </span>
                  </Link>
                  <Link
                    to="/health-analytics"
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary transition-all group"
                  >
                    <span className="material-symbols-outlined !text-3xl text-primary group-hover:scale-110 transition-transform">
                      insights
                    </span>
                    <span className="text-xs font-bold mt-2 text-slate-600 dark:text-slate-400">
                      Analytics
                    </span>
                  </Link>
                </div>
              </div>

              {/* Side Column: Diet & Meds */}
              <div className="space-y-6">
                {/* Diet Plan Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 h-full max-h-[460px] overflow-hidden flex flex-col">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      restaurant
                    </span>
                    Today's Diet Plan
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                    {todayDiet ? (
                      <>
                        <div className="flex gap-4 items-start">
                          <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <span className="material-symbols-outlined">
                              sunny
                            </span>
                          </div>
                          <div className="flex-1 border-b border-slate-50 dark:border-slate-800 pb-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Breakfast
                            </p>
                            <p className="font-bold text-sm">
                              {todayDiet.breakfast?.name || "Not generated"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {todayDiet.breakfast?.calories || 0} kcal
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <span className="material-symbols-outlined">
                              wb_sunny
                            </span>
                          </div>
                          <div className="flex-1 border-b border-slate-50 dark:border-slate-800 pb-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Lunch
                            </p>
                            <p className="font-bold text-sm">
                              {todayDiet.lunch?.name || "Not generated"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {todayDiet.lunch?.calories || 0} kcal
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <span className="material-symbols-outlined">
                              nightlight
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Dinner
                            </p>
                            <p className="font-bold text-sm">
                              {todayDiet.dinner?.name || "Not generated"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {todayDiet.dinner?.calories || 0} kcal
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No diet plan active for today. Please visit the Diet
                        Plan page to generate one!
                      </p>
                    )}
                  </div>

                  <Link
                    to="/diet-plan"
                    className="w-full shrink-0 flex items-center justify-center mt-6 py-3 text-sm font-bold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors"
                  >
                    View Full Diet Plan
                  </Link>
                </div>

                {/* Medication Reminder Card */}
                {upcomingMed && (
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 shrink-0">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        notifications_active
                      </span>
                      Up Next
                    </h3>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm flex items-center gap-4 mb-4">
                      <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined !text-3xl">
                          pill
                        </span>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">
                          {upcomingMed.medicineName}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                          {upcomingMed.time} •{" "}
                          {upcomingMed.dosage || "Prescription"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleMed(upcomingMed._id)}
                      className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Mark as Taken
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
