import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function HealthAnalyticsPage() {
  const navigate = useNavigate();

  const [todayLogs, setTodayLogs] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLog, setNewLog] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const fetchData = async () => {
    const token = localStorage.getItem("fitpulse_token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const todayRes = await fetch("https://d36bbfu262j7b7.cloudfront.net/api/food-log/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const weeklyRes = await fetch("https://d36bbfu262j7b7.cloudfront.net/api/food-log/weekly", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!todayRes.ok || !weeklyRes.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      // Check if the Vite dev proxy returned an HTML fallback due to backend being offline
      const contentType1 = todayRes.headers.get("content-type");
      if (contentType1 && contentType1.includes("text/html")) {
        throw new Error("Backend server is unreachable! Please start backend server.");
      }

      setTodayLogs(await todayRes.json());
      setWeeklyStats(await weeklyRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("fitpulse_token");
    try {
      const res = await fetch("https://d36bbfu262j7b7.cloudfront.net/api/food-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLog),
      });
      if (!res.ok) throw new Error("Failed to add food log");

      setShowAddModal(false);
      setNewLog({
        foodName: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      });
      fetchData(); // Refresh data
    } catch (err) {
      alert(err.message);
    }
  };

  // Calculations
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

  // Macros Pie Chart Math
  const totalMacros = totalProtein + totalCarbs + totalFats;
  const proteinPct = totalMacros
    ? Math.round((totalProtein / totalMacros) * 100)
    : 0;
  const carbsPct = totalMacros
    ? Math.round((totalCarbs / totalMacros) * 100)
    : 0;
  const fatsPct = totalMacros ? Math.round((totalFats / totalMacros) * 100) : 0;

  const proteinDash = `${proteinPct}, 100`;
  const carbsDash = `${carbsPct}, 100`;
  const carbsOffset = `-${proteinPct}`;
  const fatsDash = `${fatsPct}, 100`;
  const fatsOffset = `-${proteinPct + carbsPct}`;

  // Peak weekly calories to scale bars
  const maxWeeklyCalories = Math.max(
    ...weeklyStats.map((s) => s.calories || 0),
    2000
  );

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Health Analytics
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Real-time insights into your nutritional goals.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
                Log Meal
              </button>
            </div>
          </header>

          <div className="px-8 pb-12 flex flex-col gap-8 max-w-7xl">
            {error && (
              <div className="text-red-500 bg-red-100 p-4 rounded-xl">
                {error}
              </div>
            )}

            {/* Health Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-sm font-medium">
                    Calories Today
                  </span>
                  <span className="material-symbols-outlined text-primary/60">
                    bolt
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {totalCalories}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    kcal
                  </span>
                </p>
                <span className="text-primary text-sm font-medium flex items-center gap-0.5">
                  Live tracking
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-sm font-medium">
                    Protein Intake
                  </span>
                  <span className="material-symbols-outlined text-primary/60">
                    egg
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {totalProtein}{" "}
                  <span className="text-sm font-normal text-slate-400">g</span>
                </p>
                <span className="text-primary text-sm font-medium flex items-center gap-0.5">
                  {proteinPct}% of macros
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-sm font-medium">
                    Meals Logged
                  </span>
                  <span className="material-symbols-outlined text-primary/60">
                    inventory
                  </span>
                </div>
                <p className="text-2xl font-bold">{mealsLogged}</p>
                <span className="text-primary text-sm font-medium flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>{" "}
                  Tracked today
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-sm font-medium">
                    Health Score
                  </span>
                  <span className="material-symbols-outlined text-primary/60">
                    verified_user
                  </span>
                </div>
                <p className="text-2xl font-bold">Good</p>
                <span className="text-primary text-sm font-medium flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>{" "}
                  Keep it up!
                </span>
              </div>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Calorie Intake (Bar Chart) */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold">Weekly Calorie Intake</h3>
                </div>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    Loading...
                  </div>
                ) : (
                  <div className="relative h-64 w-full flex items-end justify-between gap-4">
                    {weeklyStats.map((stat) => {
                      const dateObj = new Date(stat.date);
                      const dayName = dateObj.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      const heightPct = Math.min(
                        (stat.calories / maxWeeklyCalories) * 100,
                        100
                      );

                      return (
                        <div
                          key={stat.date}
                          className="flex flex-col items-center flex-1 gap-2 h-full justify-end group"
                        >
                          <div
                            className="relative w-full px-2 max-w-[40px] flex justify-center"
                            style={{ height: `${Math.max(heightPct, 5)}%` }}
                          >
                            {/* Tooltip */}
                            <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              {stat.calories} kcal
                            </div>
                            <div className="w-full h-full bg-primary rounded-t-md hover:opacity-80 transition-opacity"></div>
                          </div>
                          <span className="text-xs font-bold text-slate-400">
                            {dayName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Macronutrient Breakdown (Pie-style Representation) */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm">
                <h3 className="font-bold mb-6">Macronutrient Breakdown</h3>
                <div className="flex flex-col gap-6">
                  {totalMacros > 0 ? (
                    <div className="relative size-32 mx-auto">
                      <svg
                        className="size-full transform -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          className="stroke-slate-100 dark:stroke-slate-700"
                          strokeWidth="4"
                        ></circle>
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          stroke="#21c45d"
                          strokeDasharray={proteinDash}
                          strokeLinecap="round"
                          strokeWidth="4"
                        ></circle>
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          stroke="#fbbf24"
                          strokeDasharray={carbsDash}
                          strokeDashoffset={carbsOffset}
                          strokeLinecap="round"
                          strokeWidth="4"
                        ></circle>
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          stroke="#f43f5e"
                          strokeDasharray={fatsDash}
                          strokeDashoffset={fatsOffset}
                          strokeLinecap="round"
                          strokeWidth="4"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xl font-bold">
                          {totalMacros}g
                        </span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold">
                          Total
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative size-32 mx-auto flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 rounded-full">
                      <span className="text-xs font-medium text-slate-400">
                        No Data
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary"></div>
                        <span className="text-sm">Protein</span>
                      </div>
                      <span className="text-sm font-bold">
                        {totalProtein}g ({proteinPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-amber-400"></div>
                        <span className="text-sm">Carbs</span>
                      </div>
                      <span className="text-sm font-bold">
                        {totalCarbs}g ({carbsPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-rose-500"></div>
                        <span className="text-sm">Fats</span>
                      </div>
                      <span className="text-sm font-bold">
                        {totalFats}g ({fatsPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity/Log */}
            <section className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 shadow-sm overflow-hidden mb-12">
              <div className="p-6 border-b border-primary/5 flex justify-between items-center">
                <h3 className="font-bold">Recent Nutritional Logs</h3>
                <span className="text-xs text-slate-400 font-medium">
                  Today
                </span>
              </div>
              <div className="divide-y divide-primary/5">
                {todayLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No meals logged today yet. Click "Log Meal" to get started!
                  </div>
                ) : (
                  todayLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            restaurant
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {log.foodName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Logged at{" "}
                            {new Date(log.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{log.calories} kcal</p>
                        <p className="text-xs text-primary font-medium">
                          {log.protein}g Protein
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
              Log A Meal
            </h3>
            <form onSubmit={handleAddLog} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  value={newLog.foodName}
                  onChange={(e) =>
                    setNewLog({ ...newLog, foodName: e.target.value })
                  }
                  placeholder="e.g. Grilled Chicken Salad"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={newLog.calories}
                    onChange={(e) =>
                      setNewLog({ ...newLog, calories: e.target.value })
                    }
                    placeholder="e.g. 450"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={newLog.protein}
                    onChange={(e) =>
                      setNewLog({ ...newLog, protein: e.target.value })
                    }
                    placeholder="e.g. 35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={newLog.carbs}
                    onChange={(e) =>
                      setNewLog({ ...newLog, carbs: e.target.value })
                    }
                    placeholder="e.g. 15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fats (g)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={newLog.fats}
                    onChange={(e) =>
                      setNewLog({ ...newLog, fats: e.target.value })
                    }
                    placeholder="e.g. 10"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl font-semibold transition-colors"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default HealthAnalyticsPage;
