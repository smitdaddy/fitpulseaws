import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const sampleImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuALd3pG3joW-cnYe0kVEM53C6msYapTj41QD-au_ESZZw0gIcD7S0nUfUzltoDOuCKcnIrYhgXAuQsTR4ePKf45lQR_zHqq4FLL1HwZAiszoimYAHRvIRaXT9l7jWP6UO5tjH016Z6bdLpqQrGhlgysVVTRZQ4SdiBsqUX-YOWdq6SK9Kc3nhuXeCDBPqylxcw6EIyJ_Hq39lrxQOOfAQyVzcg_6wa2CYFBCeD6XrfgZ0ZKx16_3cH42OIAYOqKySMTl2sPfnBXPkJJ";

const API_URL = "https://d36bbfu262j7b7.cloudfront.net";

const MEAL_TYPES = [
  {
    value: "breakfast",
    label: "Breakfast",
    icon: "sunny",
    color:
      "text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: "wb_sunny",
    color:
      "text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700",
  },
  {
    value: "dinner",
    label: "Dinner",
    icon: "nightlight",
    color:
      "text-indigo-500 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700",
  },
  {
    value: "snack",
    label: "Snack",
    icon: "cookie",
    color:
      "text-green-500 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700",
  },
  {
    value: "pre-workout",
    label: "Pre-Workout",
    icon: "fitness_center",
    color:
      "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700",
  },
  {
    value: "post-workout",
    label: "Post-Workout",
    icon: "sports_score",
    color: "text-primary bg-primary/5 border-primary/30",
  },
];

const getMealMeta = (type) =>
  MEAL_TYPES.find((m) => m.value === type) || MEAL_TYPES[3];

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const [, base64 = ""] = result.split(",");
      resolve({
        previewUrl: result,
        image: { mimeType: file.type, data: base64 },
      });
    };
    reader.onerror = () =>
      reject(new Error("Could not read the selected image"));
    reader.readAsDataURL(file);
  });

function AiScanningBadge({ active }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all duration-500 ${
        active
          ? "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40 animate-pulse"
          : "text-primary bg-primary/10"
      }`}
    >
      {active ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          AI Analyzing…
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          AI Ready
        </>
      )}
    </span>
  );
}

function FoodScannerPage() {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const [foodName, setFoodName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(sampleImage);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [mealType, setMealType] = useState("breakfast");

  const getToken = () => {
    const token = localStorage.getItem("fitpulse_token");
    if (!token) navigate("/signin");
    return token;
  };

  const fetchRecentScans = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/food-log/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRecentScans(await res.json());
    } catch {
      setRecentScans([]);
    }
  };

  useEffect(() => {
    fetchRecentScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      setSaveMessage("");
      const { previewUrl: nextPreviewUrl } = await readImageFile(file);
      setPreviewUrl(nextPreviewUrl);
      setSelectedImage(file);
    } catch (err) {
      setError(err.message);
    } finally {
      event.target.value = "";
    }
  };

  const handleScan = async () => {
    const token = getToken();
    if (!token) return;
    if (!foodName.trim() && !selectedImage) {
      setError("Enter a food name or upload a clear food photo first.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSaveMessage("");

      const formData = new FormData();
      if (foodName.trim()) formData.append("foodName", foodName.trim());
      if (selectedImage) formData.append("image", selectedImage);

      const res = await fetch(`${API_URL}/api/food-log/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not scan this food");
      setScanResult(data);
      if (!foodName.trim()) setFoodName(data.foodName || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLog = async () => {
    const token = getToken();
    if (!token || !scanResult) return;
    try {
      setSaving(true);
      setError("");
      setSaveMessage("");

      const formData = new FormData();
      if (scanResult.foodName) formData.append("foodName", scanResult.foodName);
      if (scanResult.calories) formData.append("calories", scanResult.calories);
      if (scanResult.carbs) formData.append("carbs", scanResult.carbs);
      if (scanResult.protein) formData.append("protein", scanResult.protein);
      if (scanResult.fats) formData.append("fats", scanResult.fats);
      if (mealType) formData.append("mealType", mealType);
      if (selectedImage) formData.append("image", selectedImage);

      const res = await fetch(`${API_URL}/api/food-log`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Could not add this meal to your log");
      setSaveMessage(`Logged as ${getMealMeta(mealType).label} ✓`);
      await fetchRecentScans();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetScan = () => {
    setFoodName("");
    setSelectedImage(null);
    setPreviewUrl(sampleImage);
    setScanResult(null);
    setError("");
    setSaveMessage("");
  };

  const macroTotal = scanResult
    ? (scanResult.carbs || 0) +
      (scanResult.protein || 0) +
      (scanResult.fats || 0)
    : 0;
  const carbsPct = macroTotal
    ? Math.round(((scanResult.carbs || 0) / macroTotal) * 100)
    : 0;
  const proteinPct = macroTotal
    ? Math.round(((scanResult.protein || 0) / macroTotal) * 100)
    : 0;
  const fatsPct = Math.max(0, 100 - carbsPct - proteinPct);

  // Dashboard totals from today's log
  const totalCalories = recentScans.reduce((s, l) => s + (l.calories || 0), 0);
  const totalProtein = recentScans.reduce((s, l) => s + (l.protein || 0), 0);
  const totalCarbs = recentScans.reduce((s, l) => s + (l.carbs || 0), 0);

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="px-8 py-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Food Scanner
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Scan your meal to instantly view calories and nutrition
                  insights.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                </button>
                <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary overflow-hidden">
                  <img
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6poAusi7ivo0kvPEn57qGV86qrbt1DLAGv-OwQZjaObNwce4SRb8AKVXDqt93RxhJW_IFL-49PqaUkoRj_qe72mlHpbBmgUnfY03dOZ1Fzcc62lkubZHMPFLEIIaxPPVIrVfSIyqVPI8Blcekpn-iFuGX-3YOHBB97MgSrX_ZUj_Xtfxp28vKikMVu0gf-3aCE5FHPzkGEqNa4xtacLiZTHT-VNyJDIsG1VMk9msAwDuzZYoCUWRCf9bASg5L-vjJkH3wlYgUgCuF"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Today's summary strip */}
          {recentScans.length > 0 && (
            <div className="max-w-6xl mx-auto px-8 mb-2">
              <div className="flex gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary !text-base">
                    local_fire_department
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {totalCalories} kcal
                  </span>
                  <span className="text-slate-500">today</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 !text-base">
                    fitness_center
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {totalProtein}g
                  </span>
                  <span className="text-slate-500">protein</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 !text-base">
                    restaurant
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {recentScans.length}
                  </span>
                  <span className="text-slate-500">meals logged</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500 !text-base">
                    grain
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {totalCarbs}g
                  </span>
                  <span className="text-slate-500">carbs</span>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto px-8 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Card header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Live Scanner</h3>
                  <AiScanningBadge active={loading} />
                </div>

                <div className="p-6">
                  {/* Preview */}
                  <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden group">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70 transition-all duration-500"
                      style={{ backgroundImage: `url('${previewUrl}')` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                        {loading && <div className="scanning-line"></div>}
                      </div>
                    </div>
                    {loading && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="flex gap-1 justify-center mb-2">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="w-1.5 h-6 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.12}s` }}
                              ></div>
                            ))}
                          </div>
                          <p className="text-sm font-semibold tracking-wide">
                            AI is analyzing your meal…
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Food name input */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Food name or meal description
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      placeholder="e.g. 2 idlis with coconut chutney"
                    />
                  </div>

                  <input
                    ref={cameraInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                  />
                  <input
                    ref={uploadInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
                    >
                      <span className="material-symbols-outlined">
                        photo_camera
                      </span>
                      Open Camera
                    </button>
                    <button
                      onClick={() => uploadInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                      <span className="material-symbols-outlined">upload</span>
                      Upload Image
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={handleScan}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white font-black text-lg rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    <span className="material-symbols-outlined text-3xl">
                      center_focus_strong
                    </span>
                    {loading ? "ANALYZING FOOD…" : "SCAN FOOD"}
                  </button>
                  {error && (
                    <p className="mt-3 text-sm font-medium text-red-500">
                      {error}
                    </p>
                  )}
                  {saveMessage && (
                    <p className="mt-3 text-sm font-medium text-primary">
                      {saveMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Pro tip */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Pro Tip
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    For better accuracy, include portion details like quantity,
                    bowl size, toppings, and cooking style.
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Nutrition card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {scanResult
                        ? `Detected: ${scanResult.foodName}`
                        : "Ready to scan"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold uppercase tracking-widest bg-primary text-white px-2 py-0.5 rounded">
                        {scanResult
                          ? `${Math.round(
                              (scanResult.confidence || 0) * 100
                            )}% Confidence`
                          : "AI Estimate"}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {scanResult?.servingSize || "Add a food name or photo"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary">
                      {scanResult?.calories ?? "--"}
                    </p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                      Calories
                    </p>
                  </div>
                </div>

                {/* Macro pills */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    ["Protein", "protein", "bg-green-400"],
                    ["Carbs", "carbs", "bg-blue-400"],
                    ["Fat", "fats", "bg-orange-400"],
                  ].map(([label, key, color]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-center border border-slate-100 dark:border-slate-700"
                    >
                      <p className="text-xs font-medium text-slate-400 uppercase mb-1">
                        {label}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {scanResult?.[key] ?? "--"}g
                      </p>
                      <div
                        className={`mt-1 h-1 rounded-full ${color} mx-auto`}
                        style={{
                          width: scanResult ? "70%" : "30%",
                          opacity: scanResult ? 1 : 0.3,
                        }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Donut chart */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm">Nutrition Breakdown</h4>
                    <span className="text-xs text-primary font-medium">
                      {scanResult ? "Estimated Portion" : "Waiting"}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <circle
                          className="stroke-slate-100 dark:stroke-slate-700"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeWidth="3"
                        ></circle>
                        <circle
                          className="stroke-primary"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray={`${carbsPct}, 100`}
                          strokeWidth="3"
                        ></circle>
                        <circle
                          className="stroke-blue-400"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray={`${proteinPct}, 100`}
                          strokeDashoffset={`-${carbsPct}`}
                          strokeWidth="3"
                        ></circle>
                        <circle
                          className="stroke-orange-400"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="16"
                          strokeDasharray={`${fatsPct}, 100`}
                          strokeDashoffset={`-${carbsPct + proteinPct}`}
                          strokeWidth="3"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black">
                          {scanResult ? "100%" : "--"}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Total
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      {[
                        ["Carbs", "stroke-primary", "bg-primary", carbsPct],
                        [
                          "Protein",
                          "stroke-blue-400",
                          "bg-blue-400",
                          proteinPct,
                        ],
                        ["Fat", "stroke-orange-400", "bg-orange-400", fatsPct],
                      ].map(([l, , dot, pct]) => (
                        <div
                          key={l}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${dot}`}
                            ></span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {l}
                            </span>
                          </div>
                          <span className="font-bold">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {scanResult?.notes && (
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                      {scanResult.notes}
                    </p>
                  )}
                </div>

                {/* ── Meal Type Selector ── */}
                {scanResult && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Log as
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {MEAL_TYPES.map((mt) => (
                        <button
                          key={mt.value}
                          onClick={() => setMealType(mt.value)}
                          className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-bold transition-all ${
                            mealType === mt.value
                              ? mt.color +
                                " ring-2 ring-offset-1 ring-primary/40 scale-[1.03]"
                              : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {mt.icon}
                          </span>
                          {mt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToLog}
                    disabled={!scanResult || saving}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      "Adding…"
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">
                          {getMealMeta(mealType).icon}
                        </span>
                        Add to {getMealMeta(mealType).label}
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetScan}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Scan Another Food
                  </button>
                </div>
              </div>

              {/* ── Recent Scans (dynamic) ── */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h4 className="font-bold text-sm">Today's Food Log</h4>
                  {recentScans.length > 0 && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {recentScans.length}{" "}
                      {recentScans.length === 1 ? "entry" : "entries"}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {recentScans.length === 0 ? (
                    <div className="p-6 text-center">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 !text-4xl">
                        restaurant
                      </span>
                      <p className="text-sm text-slate-500 mt-2">
                        No meals logged today yet.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Scan your first food to get started!
                      </p>
                    </div>
                  ) : (
                    recentScans.map((scan) => {
                      const meta = getMealMeta(scan.mealType);
                      return (
                        <div
                          key={scan._id}
                          className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center ${meta.color}`}
                            >
                              <span className="material-symbols-outlined text-base">
                                {meta.icon}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                {scan.foodName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${meta.color}`}
                                >
                                  {meta.label}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(scan.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-primary">
                              {scan.calories} kcal
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {scan.protein ?? 0}g protein
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {recentScans.length > 0 && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                      <span>Total today</span>
                      <span className="text-primary">{totalCalories} kcal</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default FoodScannerPage;
