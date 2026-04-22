import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MedicationTrackerPage() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    medicineName: "",
    dosage: "",
    time: "",
    frequency: "daily",
  });

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayStr = getTodayString();

  const fetchMedications = async () => {
    const token = localStorage.getItem("fitpulse_token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const res = await fetch("/api/medications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch medications");
      setMedications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleTaken = async (id) => {
    const token = localStorage.getItem("fitpulse_token");
    try {
      const res = await fetch(`/api/medications/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: todayStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Optimistically update
      setMedications((meds) => meds.map((m) => (m._id === id ? data : m)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("fitpulse_token");
    try {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMedications([...medications, data]);
      setShowAddModal(false);
      setNewMed({ medicineName: "", dosage: "", time: "", frequency: "daily" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medication?")) return;
    const token = localStorage.getItem("fitpulse_token");
    try {
      await fetch(`/api/medications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications((meds) => meds.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const takenCount = medications.filter((m) =>
    m.takenDates?.includes(todayStr)
  ).length;
  const totalCount = medications.length;
  const adherenceRate = totalCount
    ? Math.round((takenCount / totalCount) * 100)
    : 0;

  // Let's find the nearest upcoming medication that is NOT taken
  const upcomingMed = medications.find(
    (m) => !m.takenDates?.includes(todayStr)
  );

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
          <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Medication Tracker
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage your prescriptions and daily vitamins.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              <span>Add Medication</span>
            </button>
          </header>

          {/* Upcoming Medication Card */}
          {upcomingMed && (
            <section className="mb-12">
              <div className="relative overflow-hidden bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 @container">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div
                    className="w-full md:w-48 h-32 rounded-lg bg-cover bg-center"
                    data-alt="Close up photo of white medical pills"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkI3tUlGCz-6xLy2zadioA2oBqDMIyrs_ei1X_3frDfOXRnQUsxEsYWi1W5YtCUfjNUr5Vs4LhjTB9deBqhb-QXtBgSeyCuNEx4S-aZOEqQ6O22a4JfvpmUHHwac9YxX3mldo3yxKUA8_BvwLgAkYkxp0jFIYAESShTM_IJrlzF_rDlHz9r5gWugxqdilT7GtXHeeoWfBtjz5tPir5Q2yqF0-suO4IjCAbPvjQrziF572b5gvQ8OJ4A42j_oV8UEuGlZPfyEL14tDr')",
                    }}
                  ></div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
                        Upcoming Dose
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {upcomingMed.medicineName}, {upcomingMed.dosage}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                        <span className="material-symbols-outlined text-[18px]">
                          schedule
                        </span>
                        <span className="text-sm">
                          Scheduled for {upcomingMed.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <button
                        onClick={() => handleToggleTaken(upcomingMed._id)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          check_circle
                        </span>
                        Mark as Taken
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block w-px h-24 bg-slate-100 dark:bg-slate-700"></div>
                  <div className="hidden lg:flex flex-col items-center justify-center px-8 text-center">
                    <p className="text-3xl font-black text-primary">
                      {adherenceRate}%
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium uppercase mt-1">
                      Today's Adherence
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Medication List Table */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Daily Schedule
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  Filter by:
                </span>
                <select className="text-xs font-semibold bg-transparent border-none focus:ring-0 text-primary cursor-pointer">
                  <option>All Active</option>
                  <option>Morning</option>
                  <option>Evening</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Dosage
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-slate-500"
                      >
                        Loading medications...
                      </td>
                    </tr>
                  ) : medications.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-slate-500"
                      >
                        No medications added yet.
                      </td>
                    </tr>
                  ) : (
                    medications.map((med) => {
                      const isTaken = med.takenDates?.includes(todayStr);
                      return (
                        <tr
                          key={med._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[20px]">
                                  medication
                                </span>
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {med.medicineName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {med.dosage || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {med.time}
                          </td>
                          <td className="px-6 py-4">
                            {isTaken ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <span className="size-1.5 rounded-full bg-green-500"></span>
                                Taken
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <span className="size-1.5 rounded-full bg-amber-500"></span>
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleTaken(med._id)}
                                className="text-slate-400 hover:text-primary transition-colors text-sm font-semibold"
                                title="Toggle Taken"
                              >
                                {isTaken ? "Undo" : "Take"}
                              </button>
                              <button
                                onClick={() => handleDelete(med._id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete Medication"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination/Status footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
              <p>
                {takenCount} of {totalCount} medications taken today
              </p>
              <div className="flex gap-4">
                <button className="hover:text-primary transition-colors">
                  Refill History
                </button>
                <button className="hover:text-primary transition-colors">
                  Export Logs
                </button>
              </div>
            </div>
          </section>

          {/* Add Medication Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                  Add Medication
                </h3>
                <form
                  onSubmit={handleAddMedication}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Medicine Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={newMed.medicineName}
                      onChange={(e) =>
                        setNewMed({ ...newMed, medicineName: e.target.value })
                      }
                      placeholder="e.g. Vitamin D3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={newMed.dosage}
                      onChange={(e) =>
                        setNewMed({ ...newMed, dosage: e.target.value })
                      }
                      placeholder="e.g. 2000 IU or 500mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input
                      required
                      type="time"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={newMed.time}
                      onChange={(e) =>
                        setNewMed({ ...newMed, time: e.target.value })
                      }
                    />
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
                      Add Medicine
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default MedicationTrackerPage;
