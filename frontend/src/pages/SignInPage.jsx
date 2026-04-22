import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

// ⚠️  Replace with your real Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "822753941540-vinfiodjmv0iadcrgo068s5o2r5se1d4.apps.googleusercontent.com";

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        throw new Error(data.message || "Google sign-in failed");
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

      // Render the branded Google button
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: googleBtnRef.current.offsetWidth,
        });
      }
    };

    // The GSI script loads async, so we may need to wait for it
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

  // ── Normal email/password sign-in ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to sign in");
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
        {/* Left Side: Visual/Gradient Section */}
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
              Elevate your <br />
              fitness journey.
            </h2>
            <p className="text-emerald-50 text-xl max-w-md">
              Join thousands of people reaching their health goals with
              personalized tracking and expert-led routines.
            </p>
          </div>
          <div className="relative z-10 flex gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-emerald-500"
                alt="Portrait of a smiling fitness user"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzvkeHLFZZUSCILUp6mZUf0rmFe2_tzPIDz9iJG7WSZ83OodT28mGXETc096lL6_OvIGl2Y_AjY2hEcrBqj8T0A2jrMK_-UHlQEkWQfFHBlKMSN3XKgdUF0WtpGoXaqvdOk0lI5FLSr6ckKjRDxhNAvhR8bI7SkIHKon7S9RAFe5-v6dk8gKqkNIuXt7qYd9nizAarBbPnUkbVU5EQNy1kDMzXxojXzVtHPAeHihpe8VuhavMPWBrrhQ2RSiWESUxs0Io1FAfIS-lT"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-emerald-500"
                alt="Portrait of a male fitness enthusiast"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQebyFaWikNYQvpTlr3BzXNcFX_4tKydczL6BtElziM0071reJzzBOOKB2kKQmXihThlSOo61Cqz3QFsxXHTIe1AvtjQxc10O1lRSloSlmPh9LL4vro7tjGchMMDHegde-uYbEOsNlEFqVXwlLki67jbFSZ1Pa3TOl87-zgdFW0otGtYEnkYofThP5LQ5JVYVao6SJjdpQXcsclIWoFJhCtnKmP7QmaTAJTVchkiclosb_pV-EdY0O_oNkdrmGxIMmBqncfpE2_xJE"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-emerald-500"
                alt="Happy young woman using fitness app"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsKS5-v03dtIgP3ZXFC5DnAOm7TxQxo1r9ubh5p5bDTZcu_BRTFoOoMFkZgKFzn4a_-zD-xxjarpgjNu_c1G4SKdMwo9QAoFl5Mo3qyNSEjr4iQ-xXoDCiBDhc4DcBOpTSybC8E0ptbJjAKbE7slxJjIeM3JxshGNwtbJHeJuOLM9wCFoagoWsFRw9A1PIzx-4ilrvBHLC1oPYdZrYHUhZY4mm6t3xHXRD29aN5xqWXEo1N0kr9jfJ7J1A-k8cNhMq2N53RPFuCtBG"
              />
            </div>
            <div className="text-emerald-50 text-sm">
              <p className="font-bold">10k+ active users</p>
              <p>Trust our platform daily</p>
            </div>
          </div>
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side: Login Form */}
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
                Welcome Back
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Please enter your details to sign in.
              </p>
            </div>
            <div className="space-y-6">
              {/* ── Google Sign-In Button ── */}
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
                    Signing in with Google…
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background-light dark:bg-background-dark px-2 text-slate-500">
                    Or sign in with email
                  </span>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Input */}
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
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      className="text-xs font-bold text-primary hover:underline"
                      href="#"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                      lock
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {/* Error */}
                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}
                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full py-3.5 bg-primary hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-center"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </div>
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  className="text-primary font-bold hover:underline"
                  to="/signup"
                >
                  Create Account
                </Link>
              </p>
            </div>
            {/* Footer Links */}
            <div className="mt-auto flex justify-center gap-6 text-xs text-slate-400">
              <a className="hover:text-primary" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-primary" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
