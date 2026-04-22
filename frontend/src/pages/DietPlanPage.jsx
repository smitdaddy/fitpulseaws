import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getTodayIndex() {
  const day = new Date().getDay(); // 0 = Sunday
  return day === 0 ? 6 : day - 1; // 0 = Mon … 6 = Sun
}

// Food-image placeholder per meal type
const MEAL_IMAGES = {
  breakfast: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvll6NJcTblof8-3Zf2viMVJBx9QOeZjmKSnTpvfM-v-XqmPdfN-xOl8jArD_LP3Mh2Y6IwZl4OmcG5VaAdiJPn_o9ciEccUKhCyVWNV_PuF8EtNE9TnjfnCtv2pH3_AZTndxWkoGkMpMhlzgvk4HFvsxiZZ2VoOcL4lh3niYpQpeSQB6kZ4Y29irj-g0dgaU900OWf4KUGIBAzadfCsPLrnUwA7KvuUqPo2bw_xV7HY_aSlNdUQSaDG0xchutQLfi9JFo55P9rwBQ",
  lunch:     "https://lh3.googleusercontent.com/aida-public/AB6AXuBtetNY19Pj7Qy2lZRyN5x2JdNfBUHnoytcDsDJTj36feWOTPRL6O2OGsotbbt56JmEJg8bX1uhNezBegW1z6rkbs2DziVSz-j8-HMhS6b39I0EZEVf0oOZHSFaxeUsapJW9egicWePpWFp6B5u5Nw6ghI_A6iKTSnEHkATjiR1Znsj3xeFcwPGYMN-7U0k1knQ51NZ_z9am1Fr5tfQOPtRNjclNsI5ATVIWf_6wUXS-CJgsZ4fRambwYV_z8O8kPP1TXbA2azae9Dx",
  snack:     "https://lh3.googleusercontent.com/aida-public/AB6AXuCoK_tSIU4ue2BAiB0fg295k2HlpgY6spZGTD78h3oA0nCAORiwu1TRPKW3r423EkhBJJC5hIc0CWBNreIRUnUvpUV9KzTUHVSK15aPssyzz5pg5R6o3qYHgHxvX0dbNI2bhWhc29A4dBBXJi5znyf_ks2oMlztEVCo41LieI_W0rhIrKsg9yDJmDxmcYtclhH3Lk9uIPz-EWid4NYDr2dzy5eeBxGHkSozJFBbOSLaMHYbhD9v3TwyA4UD-wDOoYDvJlwkQo60MHXj",
  dinner:    "https://lh3.googleusercontent.com/aida-public/AB6AXuCRbTAAsyR9wtjzJ8saIJmokS8iPSIVpTSbqsB-N3quKhSWaSDJTj36fxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx_chapati",
};

const MEAL_FALLBACK = "https://lh3.googleusercontent.com/aida-public/AB6AXuCRbTAAsyR9wtjzJ8saIJmokS8iPSIVpTSbqsB-N3quKhSWyJnLojymWRxdvkfN7pO_FrizeF6DoSpkImng_5Aqa6nDbatCNKu59t1zfxpJjRKi0lKSy2DI5BlYrc9refcKcBXCjzWvQIXif4PU8BaPto1F0QcLrwT9mQjoW_ZJqxD_6X5yJBDFkeB7uIjadS7bqPEOzSpgxniCoMXJNCH32otwfLFKiL6MYlKYQuErm7ie0DBFuLUXOJoOJ9v754aEbToPhveEY6-q";

function mealImg(type) {
  return MEAL_IMAGES[type] || MEAL_FALLBACK;
}

function MacroBar({ label, current, target, color }) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-slate-500 uppercase tracking-wide">{label}</span>
        <span>{current}g / {target}g</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function EmptyState({ onGenerate, generating }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary !text-4xl">restaurant_menu</span>
      </div>
      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">No diet plan yet</h3>
      <p className="text-slate-500 max-w-sm mb-8">
        Fill in your health profile in Settings, then generate a personalized weekly meal plan tailored to your condition and preferences.
      </p>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-70 transition-all"
      >
        <span className="material-symbols-outlined">auto_awesome</span>
        {generating ? 'Generating…' : 'Generate My Plan'}
      </button>
    </div>
  );
}

function DietPlanPage() {
  const navigate = useNavigate();
  const [plan, setPlan]           = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState('');

  const todayIndex = getTodayIndex();

  const getToken = () => {
    const t = localStorage.getItem('fitpulse_token');
    if (!t) navigate('/signin');
    return t;
  };

  // ── Load existing plan + health profile + today's food log ──
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [planRes, profileRes, logsRes] = await Promise.all([
          fetch('/api/diet', { headers }),
          fetch('/api/health-profile', { headers }),
          fetch('/api/food-log/today', { headers }),
        ]);

        if (planRes.ok)    setPlan(await planRes.json());
        else if (planRes.status !== 404) {
          const d = await planRes.json();
          setError(d.message || 'Failed to load diet plan.');
        }

        if (profileRes.ok) setHealthProfile(await profileRes.json());
        if (logsRes.ok)    setTodayLogs(await logsRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Generate a fresh plan ──
  const handleGenerateNew = async () => {
    const token = getToken();
    if (!token) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/diet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate diet plan. Make sure your health profile is filled.');
      setPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Derived data ──
  const todayPlan = plan?.weeklyPlan?.[todayIndex];
  const breakfast = todayPlan?.breakfast;
  const lunch     = todayPlan?.lunch;
  const snack     = todayPlan?.snack;
  const dinner    = todayPlan?.dinner;

  // Today's consumed macros from food-log
  const consumed = {
    calories: todayLogs.reduce((s, l) => s + (l.calories || 0), 0),
    protein:  todayLogs.reduce((s, l) => s + (l.protein  || 0), 0),
    carbs:    todayLogs.reduce((s, l) => s + (l.carbs    || 0), 0),
    fats:     todayLogs.reduce((s, l) => s + (l.fats     || 0), 0),
  };

  // Targets from today's diet plan meals
  const planCalories = [breakfast, lunch, snack, dinner]
    .reduce((s, m) => s + (m?.calories || 0), 0);

  // Rough macro targets (30% protein, 45% carbs, 25% fats from planCalories)
  const targetProtein = planCalories ? Math.round(planCalories * 0.30 / 4) : 80;
  const targetCarbs   = planCalories ? Math.round(planCalories * 0.45 / 4) : 250;
  const targetFats    = planCalories ? Math.round(planCalories * 0.25 / 9) : 60;

  const adherencePct = planCalories
    ? Math.min(100, Math.round((consumed.calories / planCalories) * 100))
    : consumed.calories > 0 ? Math.min(100, Math.round((consumed.calories / 2000) * 100)) : 0;
  const adherenceOffset = Math.round(213.6 - (213.6 * adherencePct) / 100);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="material-symbols-outlined text-primary !text-3xl">restaurant_menu</span>
            </div>
            <p className="text-slate-500 font-medium">Loading your diet plan…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {/* ── Header ── */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Personalized Diet Plan</h1>
              <p className="text-slate-500 dark:text-slate-400">Your customized nutrition roadmap for optimal health</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateNew}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-70 transition-opacity"
              >
                <span className={`material-symbols-outlined text-[18px] ${generating ? 'animate-spin' : ''}`}>
                  {generating ? 'autorenew' : 'auto_awesome'}
                </span>
                {generating ? 'Generating…' : plan ? 'Regenerate Plan' : 'Generate Plan'}
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-semibold text-sm hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Adjust Preferences
              </button>
            </div>
          </header>

          {/* Error banner */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-w-2xl flex items-start gap-2">
              <span className="material-symbols-outlined text-red-400 !text-base mt-0.5">error</span>
              {error}
            </div>
          )}

          {/* ── No plan yet ── */}
          {!plan && !generating && (
            <EmptyState onGenerate={handleGenerateNew} generating={generating} />
          )}

          {generating && !plan && (
            <div className="py-16 text-center">
              <div className="flex gap-1.5 justify-center mb-4">
                {[0,1,2,3].map(i => (
                  <div key={i} className="w-2 h-8 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.13}s` }}></div>
                ))}
              </div>
              <p className="text-slate-500 font-medium">AI is crafting your personalized meal plan…</p>
            </div>
          )}

          {plan && (
            <>
              {/* ── Daily Overview ── */}
              <section className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  Today's Logged Meals
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    — {DAY_NAMES[todayIndex]}
                  </span>
                </h2>
                
                {todayLogs.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
                    <p>You haven't logged any meals yet today.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {todayLogs.map((log) => {
                      let icon = 'restaurant';
                      if (log.mealType === 'breakfast') icon = 'sunny';
                      if (log.mealType === 'lunch') icon = 'wb_sunny';
                      if (log.mealType === 'snack') icon = 'cookie';
                      if (log.mealType === 'dinner') icon = 'nightlight';

                      return (
                        <div key={log._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md inline-flex items-center gap-1">
                                <span className="material-symbols-outlined !text-[14px]">{icon}</span>
                                {log.mealType ? log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1).replace('-', ' ') : 'Food'}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined !text-[14px]">schedule</span>
                                {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                              </span>
                            </div>
                            
                            <h3 className="font-black text-lg mt-1 leading-snug line-clamp-2" title={log.foodName}>
                              {log.foodName || 'Unknown Food'}
                            </h3>
                          </div>
                          
                          <div className="mt-5 grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-slate-400 uppercase text-[9px] font-black tracking-wider mb-0.5">Kcal</span>
                              <span className="text-slate-700 dark:text-slate-200 text-[13px] font-black">{log.calories || 0}</span>
                            </div>
                            <div className="flex flex-col border-l border-slate-200 dark:border-slate-700">
                              <span className="text-slate-400 uppercase text-[9px] font-black tracking-wider mb-0.5">Prot</span>
                              <span className="text-slate-700 dark:text-slate-200 text-[13px] font-black">{log.protein || 0}<span className="text-[10px] font-normal text-slate-500 ml-0.5">g</span></span>
                            </div>
                            <div className="flex flex-col border-l border-slate-200 dark:border-slate-700">
                              <span className="text-slate-400 uppercase text-[9px] font-black tracking-wider mb-0.5">Fats</span>
                              <span className="text-slate-700 dark:text-slate-200 text-[13px] font-black">{log.fats || 0}<span className="text-[10px] font-normal text-slate-500 ml-0.5">g</span></span>
                            </div>
                            <div className="flex flex-col border-l border-slate-200 dark:border-slate-700">
                              <span className="text-slate-400 uppercase text-[9px] font-black tracking-wider mb-0.5">Carbs</span>
                              <span className="text-slate-700 dark:text-slate-200 text-[13px] font-black">{log.carbs || 0}<span className="text-[10px] font-normal text-slate-500 ml-0.5">g</span></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ── Weekly Plan Table ── */}
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                    Weekly Diet Plan
                  </h2>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/5">Day</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/5">Breakfast</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/5">Lunch</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/5">Snack</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/5">Dinner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {plan.weeklyPlan?.map((dayPlan, index) => {
                          const isToday = index === todayIndex;
                          return (
                            <tr
                              key={dayPlan.day || index}
                              className={`hover:bg-primary/5 transition-colors ${isToday ? 'bg-primary/5' : ''}`}
                            >
                              <td className={`px-5 py-4 font-bold text-sm whitespace-nowrap ${isToday ? 'text-primary' : ''}`}>
                                <div className="flex items-center gap-2">
                                  {isToday && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                                  {dayPlan.day || DAY_NAMES[index]}
                                  {isToday && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 rounded">Today</span>}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 py-5">
                                {dayPlan.breakfast?.name || <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 py-5">
                                {dayPlan.lunch?.name || <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 py-5">
                                {dayPlan.snack?.name || <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 py-5">
                                {dayPlan.dinner?.name || <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default DietPlanPage;