import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

// ⚠️  Replace with your real Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "822753941540-vinfiodjmv0iadcrgo068s5o2r5se1d4.apps.googleusercontent.com";

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const googleBtnRef = useRef(null);

  // ── Handle Google credential response ──
  const handleGoogleResponse = useCallback(async (response) => {
    setError("");
    setGoogleLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google sign-up failed");
      }

      localStorage.setItem("fitpulse_token", data.token);
      localStorage.setItem("fitpulse_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate]);

  // ── Initialize Google Identity Services ──
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signup_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: googleBtnRef.current.offsetWidth,
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleGoogleResponse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://13.206.109.35:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      localStorage.setItem("fitpulse_token", data.token);
      localStorage.setItem("fitpulse_user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased h-screen overflow-hidden">
      <div className="flex h-full w-full">
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary to-emerald-800 p-12 relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 text-white">
              <div className="bg-white p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary text-3xl font-bold">
                  exercise
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">FitPulse</h1>
            </Link>
          </div>
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Join the FitPulse community.
            </h2>
            <p className="text-emerald-50 text-xl max-w-md">
              Create your account to start tracking your fitness, nutrition, and
              health insights.
            </p>
          </div>
          <div className="relative z-10 flex gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-emerald-500 bg-emerald-300" />
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-emerald-500 bg-emerald-200" />
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-emerald-500 bg-emerald-400" />
            </div>
            <div className="text-emerald-50 text-sm">
              <p className="font-bold">Personalized insights</p>
              <p>Tailored to your health goals</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background-light dark:bg-background-dark overflow-y-auto">
          <div className="w-full max-w-md flex flex-col gap-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl font-bold">
                exercise
              </span>
              <span className="text-xl font-bold">FitPulse</span>
            </Link>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Create your account
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Enter your details to get started with FitPulse.
              </p>
            </div>

            {/* ── Google Sign-Up Button ── */}
            <div className="space-y-3">
              <div
                ref={googleBtnRef}
                className="w-full flex items-center justify-center min-h-[44px] rounded-xl overflow-hidden"
              ></div>
              {googleLoading && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-500">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}></div>
                    ))}
                  </div>
                  Creating account with Google…
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background-light dark:bg-background-dark px-2 text-slate-500">
                  Or sign up with email
                </span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    htmlFor="age"
                  >
                    Age
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    id="age"
                    name="age"
                    placeholder="25"
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="w-full px-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="block w-full py-3.5 bg-primary hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-center"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  className="text-primary font-bold hover:underline"
                  to="/signin"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
