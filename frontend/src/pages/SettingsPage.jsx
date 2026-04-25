import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fitpulse_token');
    const storedUser = localStorage.getItem('fitpulse_user');

    if (!token && !storedUser) {
      navigate('/signin');
      return;
    }

    const baseUser = storedUser ? JSON.parse(storedUser) : null;

    const loadData = async () => {
      try {
        if (token) {
          const profileRes = await fetch('https://d36bbfu262j7b7.cloudfront.net/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const profileUser = await profileRes.json();
            setUser(profileUser);
          } else if (baseUser) {
            setUser(baseUser);
          }

          const healthRes = await fetch('https://d36bbfu262j7b7.cloudfront.net/api/health-profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (healthRes.ok) {
            const hp = await healthRes.json();
            setHealthProfile(hp);
          }
        } else {
          setUser(baseUser);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    condition: '',
    height: '',
    weight: '',
    activityLevel: '',
    bloodSugarLevel: '',
    dietaryPreference: '',
    region: '',
    fitnessGoal: '',
    allergies: '',
  });

  useEffect(() => {
    if (!user) return;

    setFormState((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      age: user.age ?? '',
      gender: user.gender || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!healthProfile) return;

    setFormState((prev) => ({
      ...prev,
      condition: healthProfile.condition || '',
      height: healthProfile.height ?? '',
      weight: healthProfile.weight ?? '',
      activityLevel: healthProfile.activityLevel || '',
      bloodSugarLevel: healthProfile.bloodSugarLevel ?? '',
      dietaryPreference: healthProfile.dietaryPreference || '',
      region: healthProfile.region || '',
      fitnessGoal: healthProfile.fitnessGoal || '',
      allergies: (healthProfile.allergies || []).join(', '),
    }));
  }, [healthProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => {
      const next = { ...prev, [name]: value };
      // If gender is switched to male while PCOS was selected, clear it
      if (name === 'gender' && value === 'male' && prev.condition === 'pcos') {
        next.condition = '';
      }
      return next;
    });
  };

  // PCOS is only a valid condition for female users
  const showPcos = formState.gender !== 'male';

  const isProfileChanged = user && (
    formState.name !== (user.name || '') ||
    formState.email !== (user.email || '') ||
    formState.age !== (user.age ?? '') ||
    formState.gender !== (user.gender || '')
  );

  const handleSaveBasicProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSavingProfile(true);

    const token = localStorage.getItem('fitpulse_token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const payload = {
        name: formState.name,
        email: formState.email,
        age: formState.age ? Number(formState.age) : undefined,
        gender: formState.gender || undefined,
      };

      const res = await fetch('https://d36bbfu262j7b7.cloudfront.net/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save basic profile');
      }

      const storedUser = localStorage.getItem('fitpulse_user');
      if (storedUser) {
        const baseUser = JSON.parse(storedUser);
        localStorage.setItem('fitpulse_user', JSON.stringify({ ...baseUser, ...data }));
      }
      
      setUser(data);
      setSuccess('Profile settings saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveHealthProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const token = localStorage.getItem('fitpulse_token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const payload = {
        condition: formState.condition || undefined,
        height: formState.height ? Number(formState.height) : undefined,
        weight: formState.weight ? Number(formState.weight) : undefined,
        activityLevel: formState.activityLevel || undefined,
        bloodSugarLevel: formState.bloodSugarLevel
          ? Number(formState.bloodSugarLevel)
          : undefined,
        dietaryPreference: formState.dietaryPreference || undefined,
        region: formState.region || undefined,
        fitnessGoal: formState.fitnessGoal || undefined,
        allergies: formState.allergies
          ? formState.allergies.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch('https://d36bbfu262j7b7.cloudfront.net/api/health-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save health profile');
      }

      setHealthProfile(data);
      setSuccess('Health profile saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fitpulse_token');
    localStorage.removeItem('fitpulse_user');
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-700 dark:text-slate-200">
        <p className="text-sm font-medium">Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* SideNavBar */}
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Settings
            </h1>
            <p className="text-slate-500 dark:text-primary/70 mt-2">
              Manage your profile, health data, and account preferences.
            </p>
          </div>

          <div className="space-y-8">
            {/* Alerts */}
            {(error || success) && (
              <div className="space-y-2">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}
              </div>
            )}

            {/* Section 1: Profile Settings (basic user info, read-only for now) */}
            <section className="bg-white dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-primary/5 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Profile</h2>
                  <p className="text-sm text-slate-500">
                    Basic information from your account.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSaveBasicProfile}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Full Name</label>
                    <input
                      name="name"
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary transition-all"
                      type="text"
                      value={formState.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email Address</label>
                    <input
                      name="email"
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary transition-all"
                      type="email"
                      value={formState.email}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Age</label>
                    <input
                      name="age"
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary transition-all"
                      type="number"
                      value={formState.age}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Gender</label>
                    <select
                      name="gender"
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                      value={formState.gender}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {isProfileChanged && (
                  <div className="px-6 py-4 bg-primary/5 flex justify-end transition-all border-t border-primary/5">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      {savingProfile ? 'Saving...' : 'Save Profile Settings'}
                    </button>
                  </div>
                )}
              </form>
            </section>

            {/* Section 2: Health Profile (maps to backend schema) */}
            <section className="bg-white dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-primary/5 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">monitor_heart</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Health Profile</h2>
                  <p className="text-sm text-slate-500">
                    This information powers your plans and analytics.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSaveHealthProfile}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="condition"
                      value={formState.condition}
                      onChange={handleChange}
                      required
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="diabetes">Diabetes</option>
                      {showPcos && <option value="pcos">PCOS</option>}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Activity level</label>
                    <select
                      name="activityLevel"
                      value={formState.activityLevel}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Height (cm)</label>
                    <input
                      name="height"
                      type="number"
                      value={formState.height}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Weight (kg)</label>
                    <input
                      name="weight"
                      type="number"
                      value={formState.weight}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Fasting blood sugar (mg/dL)
                    </label>
                    <input
                      name="bloodSugarLevel"
                      type="number"
                      value={formState.bloodSugarLevel}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Dietary preference</label>
                    <select
                      name="dietaryPreference"
                      value={formState.dietaryPreference}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="non-vegetarian">Non-vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Region</label>
                    <select
                      name="region"
                      value={formState.region}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="north_india">North India</option>
                      <option value="south_india">South India</option>
                      <option value="west_india">West India</option>
                      <option value="east_india">East India</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Fitness goal</label>
                    <select
                      name="fitnessGoal"
                      value={formState.fitnessGoal}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="fat_loss">Fat Loss</option>
                      <option value="weight_gain">Weight Gain</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">
                      Allergies (comma separated)
                    </label>
                    <input
                      name="allergies"
                      type="text"
                      placeholder="e.g. peanuts, lactose"
                      value={formState.allergies}
                      onChange={handleChange}
                      className="w-full bg-background-light dark:bg-background-dark/50 border-primary/20 rounded-lg focus:ring-primary focus:border-primary transition-all p-3 text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      We use this to personalize diet plans and recommendations.
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-primary/5 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    {saving ? 'Saving...' : 'Save Health Profile'}
                  </button>
                </div>
              </form>

              {/* Computed Goals Visualizer */}
              {healthProfile?.dailyCalorieGoal && healthProfile?.dailyProteinGoal && (
                <div className="px-6 pt-0 pb-6 border-t border-primary/5 bg-background-light dark:bg-background-dark/30 mt-0">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 pt-6">Your Computed Health Goals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl shadow-sm text-center">
                      <span className="material-symbols-outlined text-emerald-500 mb-1 text-3xl">local_fire_department</span>
                      <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Daily Calorie Goal</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{healthProfile.dailyCalorieGoal} <span className="text-sm font-medium">kcal</span></p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl shadow-sm text-center">
                      <span className="material-symbols-outlined text-blue-500 mb-1 text-3xl">fitness_center</span>
                      <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Daily Protein Goal</p>
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{healthProfile.dailyProteinGoal} <span className="text-sm font-medium">g</span></p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 3: Account Settings */}
            <section className="bg-white dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-primary/5 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Account Settings</h2>
                  <p className="text-sm text-slate-500">
                    Security and notification preferences.
                  </p>
                </div>
              </div>
              <div className="divide-y divide-primary/5">
                <button className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-400">key</span>
                    <div>
                      <p className="font-bold">Change Password</p>
                      <p className="text-sm text-slate-500">
                        Secure your account with a new password.
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">
                    chevron_right
                  </span>
                </button>
                <button className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-400">
                      notifications_active
                    </span>
                    <div>
                      <p className="font-bold">Notification Preferences</p>
                      <p className="text-sm text-slate-500">
                        Choose what updates you want to receive.
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">
                    chevron_right
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full p-6 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-red-500">logout</span>
                    <div>
                      <p className="font-bold text-red-500">Logout</p>
                      <p className="text-sm text-slate-500 group-hover:text-red-400">
                        Sign out of your session on this device.
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">
                    chevron_right
                  </span>
                </button>
              </div>
            </section>
          </div>
          <footer className="mt-12 text-center text-slate-400 text-sm pb-10">
            © 2024 FitPulse Health-tech Platform. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
