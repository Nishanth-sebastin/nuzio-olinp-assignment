import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type BriefsResponse } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<BriefsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .getBriefs()
      .then(setData)
      .catch((err) => {
        if (err instanceof Error && err.message.includes("onboarding")) {
          navigate("/onboarding");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load briefs");
        }
      });
  }, [navigate]);

  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="min-h-svh bg-[#0b0b0f] text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
        <div className="text-lg font-semibold">Nuzio</div>
        <button onClick={logout} className="text-xs text-zinc-500 hover:text-zinc-300">
          Sign out
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold">
          Good morning, <span className="text-indigo-300">{firstName}</span>.
        </h1>

        {data && (
          <p className="mt-1 text-sm text-zinc-400">
            {data.briefs.length} stories · {data.briefLengthMinutes} min · voice: {data.voice.name}
          </p>
        )}

        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

        {!data && !error && <p className="mt-6 text-sm text-zinc-500">Curating your brief…</p>}

        <div className="mt-6 flex flex-col gap-3">
          {data?.briefs.map((brief) => (
            <article
              key={brief.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wide text-indigo-300 bg-indigo-500/10 rounded-full px-2 py-0.5">
                  {brief.niche}
                </span>
                <span className="text-xs text-zinc-500">{brief.minutesRead} min read</span>
              </div>

              <h2 className="font-medium leading-snug">{brief.headline}</h2>
              <p className="mt-1 text-sm text-zinc-400">{brief.summary}</p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">{brief.source}</span>
                <button
                  onClick={() => setPlayingId(playingId === brief.id ? null : brief.id)}
                  className="flex items-center gap-2 rounded-full bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1.5 hover:bg-indigo-500/20"
                >
                  {playingId === brief.id ? (
                    <>⏸ Playing ({data?.voice.name})</>
                  ) : (
                    <>▶ Play brief</>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
