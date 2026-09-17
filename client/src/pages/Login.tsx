import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(name.trim(), email.trim());
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-[#0b0b0f] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <div className="text-2xl font-semibold tracking-tight text-white">Nuzio</div>
          <h1 className="mt-8 text-3xl font-semibold text-white">Good morning.</h1>
          <p className="mt-1 text-lg text-indigo-300 italic">News on go.</p>
          <p className="mt-4 text-sm text-zinc-400">
            Personalised audio news for Indian professionals — curated every morning.
          </p>
        </div>

        {!showPicker ? (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-zinc-900 font-medium py-3 hover:bg-zinc-100 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        ) : (
          <form
            onSubmit={handleContinue}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-left"
          >
            <p className="text-xs text-zinc-500 mb-4">
              Simulated Google sign-in (assignment scope) — enter any name/email to continue.
            </p>
            <label className="block text-sm text-zinc-300 mb-1">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
              placeholder="Aarav Sharma"
            />
            <label className="block text-sm text-zinc-300 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-indigo-500"
              placeholder="aarav@gmail.com"
            />
            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-500 text-white font-medium py-3 hover:bg-indigo-400 transition-colors disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Continue →"}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-zinc-600">
          By continuing you agree to Nuzio's Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}
