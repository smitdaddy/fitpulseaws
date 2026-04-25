import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("fitpulse_user");
    const token = localStorage.getItem("fitpulse_token");

    if (!token) {
      setLoading(false);
      return;
    }

    // Prefer live profile, fall back to stored user
    const fetchProfile = async () => {
      try {
        const res = await fetch("https://d36bbfu262j7b7.cloudfront.net/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Token might be invalid or expired
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data || (storedUser ? JSON.parse(storedUser) : null));
      } catch {
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePrimaryCta = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                FitPulse
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                href="#how-it-works"
              >
                How it Works
              </a>
              <a
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                href="#community"
              >
                Community
              </a>
            </nav>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                    Hi, {user.name || user.email}
                  </span>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signin"
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-8">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  <span className="material-symbols-outlined text-sm">
                    auto_awesome
                  </span>
                  AI-Powered Fitness
                </div>
                <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
                  {user ? (
                    <>
                      Welcome back,{" "}
                      <span className="text-primary">
                        {user.name || user.email}
                      </span>
                    </>
                  ) : (
                    <>
                      Transform Your Journey with{" "}
                      <span className="text-primary">Precision</span>
                    </>
                  )}
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {user
                    ? "Pick up where you left off. Your personalized workouts, nutrition insights, and health trends are ready for you."
                    : "FitPulse integrates with your lifestyle to provide real-time health insights, personalized workout plans, and automated nutrition tracking."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handlePrimaryCta}
                    className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    disabled={loading}
                  >
                    {loading
                      ? "Loading..."
                      : user
                      ? "Go to your dashboard"
                      : "Start For Free"}
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-transparent p-4">
                  <div
                    className="h-full w-full rounded-2xl bg-slate-200 dark:bg-slate-800 shadow-2xl overflow-hidden border border-white/20"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRXdiv8PT5JxFncuRlWdBCJ5Q-C20Y6zBmWZxMt3vEj0gIP_jvoK8Yz_zysMTdFIlXc7cnvvZeAZ5tUn-2RAvLB8_iF_iq0a9GgU4_L1B5z0r5TvZv-1E7okkZdImLMnLnLrH1eXecgIRSkNflJOB2W8C2gt33VAb9ho_S-R6mIi-W29-3-zD763uw7GLQ5qPeZ9O-8RXF7a9u0y7azcDlqdNJ4PMmUbEOIjkWGD6lAY-bW8IVFLApbegvaIbFiwyFSxznHsnYBHlN')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                </div>
                {/* Floating Stats */}
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <span className="material-symbols-outlined">
                        favorite
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Heart Rate</p>
                      <p className="text-lg font-bold">124 BPM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section
          id="features"
          className="py-20 bg-white/50 dark:bg-slate-900/50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Our suite of tools is designed to help you reach your goals
                faster.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:border-primary/50 transition-colors group">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">AI Workout Generator</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Custom routines that adapt to your progress and biometric data
                  in real-time.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:border-primary/50 transition-colors group">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">monitoring</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Real-time Biometrics</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Syncs seamlessly with all major wearable devices for
                  continuous tracking.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:border-primary/50 transition-colors group">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Smart Meal Planner</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Nutrition plans based on your body composition and dietary
                  preferences.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:border-primary/50 transition-colors group">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Community Challenges</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Stay motivated with global fitness leaderboards and team
                  events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-16 lg:flex-row">
              <div className="lg:w-1/2">
                <h2 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                  How It Works
                </h2>
                <div className="space-y-12">
                  <div className="flex gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Set Your Goals</h4>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Tell us what you want to achieve: weight loss, muscle
                        gain, or endurance.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Get AI Guidance</h4>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Receive daily personalized workout and meal
                        recommendations.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Track and Evolve</h4>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Our AI adapts as you get stronger, keeping you on the
                        fastest path to success.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="rounded-3xl bg-slate-100 dark:bg-slate-800 p-8 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div
                        className="h-48 rounded-2xl bg-slate-300 dark:bg-slate-700"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-4eYxpNmgMkRp_mLaBo7aq-Rdg3ZVbr01hPLrivfgkUG-B8VKhLLkhudjD0luwnanptNGGEk6U0MdhzptkFTJc8PvCLpfCvIZwmWYIaULeQWrwtindZknEdZcR13yUbdAJGgEiJ2C7xyYZZWFsurW0D3qNPKeEZCUDa2uvzSpW8YXgrnB7nbpEZ5cSwx0dcYZpIk0vJnds8zbSp09vAp-c8koWangrSr4KioQdK_GwVvZ5EZ1b3BRbo77wpDUPlr5yMwbMizUyvIo')",
                          backgroundSize: "cover",
                        }}
                      ></div>
                      <div className="h-32 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl">
                          fitness_center
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="h-32 rounded-2xl bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-4xl">
                          check_circle
                        </span>
                      </div>
                      <div
                        className="h-48 rounded-2xl bg-slate-300 dark:bg-slate-700"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdZVhFY5bmcvAFnjn8xAbdsPfHBvSdCWepWoiVrD8EmOvkbLWVRRkLMp2qoqJ2D8QnChxJtCfY-nb7v3HnllsHwd4TgJ6JCVC_A1a2nRJC8IDcYERhNv_DFgg-2UWXT4VZsUql-12cZkuhX8T25RJMWWbrruNhyP1ZTl5EGXL_laB57ztDs8VSnFMgzViehB8jW8gSwV3-uN3a1iCbEeRemI-lBH-0qObLDX5Hjp9QYBeBdc2iB2lnBUEr35TCuyWWcoY-EaV9NzqR')",
                          backgroundSize: "cover",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-primary p-12 text-center text-white shadow-2xl shadow-primary/30">
              <h2 className="text-4xl font-black mb-6">
                Ready to reach your peak?
              </h2>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Join 50,000+ members who are transforming their lives with
                FitPulse AI. Your best self is just a click away.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/signin"
                  className="bg-white text-primary font-bold px-10 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
                >
                  Get Started for Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
                  <span className="material-symbols-outlined text-xs">
                    bolt
                  </span>
                </div>
                <span className="text-lg font-bold">FitPulse</span>
              </div>
              <p className="text-sm text-slate-500">
                The world's most advanced AI fitness companion.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Features
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Integrations
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Privacy
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Terms
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              © 2026 FitPulse AI Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a className="text-slate-400 hover:text-primary" href="#">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="text-slate-400 hover:text-primary" href="#">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a className="text-slate-400 hover:text-primary" href="#">
                <span className="material-symbols-outlined">language</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
