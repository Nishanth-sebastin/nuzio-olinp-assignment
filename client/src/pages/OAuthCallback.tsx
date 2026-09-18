import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { setToken } from "../lib/api";

export default function OAuthCallback() {
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setToken(token);
      // Full reload so AuthProvider re-hydrates from the freshly stored token.
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/login?error=missing_token";
    }
  }, [params]);

  return (
    <div className="min-h-svh bg-[#0b0b0f] text-white flex items-center justify-center">
      <p className="text-sm text-zinc-400">Signing you in…</p>
    </div>
  );
}
