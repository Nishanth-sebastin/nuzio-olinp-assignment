import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Brief, type BriefsResponse } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { useSpeechPlayer } from "../lib/useSpeechPlayer";

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

// Deterministic pseudo-waveform bars, seeded from the brief id so it stays
// stable across re-renders instead of jumping around on every tick.
function waveformBars(seed: string): number[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 40; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(20 + (h % 100) * 0.6);
  }
  return bars;
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<BriefsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);

  const player = useSpeechPlayer();

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

  const categories = useMemo(() => {
    if (!data) return ["All"];
    return ["All", ...Array.from(new Set(data.briefs.map((b) => b.niche)))];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [] as Brief[];
    return activeCategory === "All" ? data.briefs : data.briefs.filter((b) => b.niche === activeCategory);
  }, [data, activeCategory]);

  const current = filtered[currentIndex] ?? filtered[0];

  function selectCategory(cat: string) {
    setActiveCategory(cat);
    setCurrentIndex(0);
    player.stop();
  }

  function goTo(delta: number) {
    if (filtered.length === 0) return;
    player.stop();
    setCurrentIndex((i) => (i + delta + filtered.length) % filtered.length);
  }

  function handlePlayPause() {
    if (!current) return;
    player.toggle(current.id, `${current.headline}. ${current.summary}`);
  }

  const firstName = user?.name.split(" ")[0] ?? "there";
  const today = new Date();
  const dateLabel = today
    .toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();

  const isPlaying = current ? player.playingId === current.id : false;
  const progressPct = player.duration > 0 ? Math.min(100, (player.elapsed / player.duration) * 100) : 0;
  const bars = current ? waveformBars(current.id) : [];

  return (
    <div className="min-h-svh bg-[#0b0b0f] text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-1.5 text-lg font-semibold">
          <span className="text-indigo-400">♫</span> Nuzio
        </div>
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm">🔍</span>
          <span className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm relative">
            🔔
            <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400" />
          </span>
          <button onClick={logout} className="text-xs text-zinc-500 hover:text-zinc-300">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-6">
        {!data && !error && <p className="mt-6 text-sm text-zinc-500">Curating your brief…</p>}
        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

        {data && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-emerald-400 text-zinc-900"
                      : "bg-zinc-900 text-zinc-300 border border-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p className="mt-5 text-xs tracking-wide text-indigo-300">
              {dateLabel} · MORNING BRIEF
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Good morning, {firstName} — <span className="text-indigo-300 italic">{filtered.length} things.</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Audio live · Voice:{" "}
              {data.voice.name} · {filtered.length} stories · {data.briefLengthMinutes} min
            </p>

            {current ? (
              <article className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-indigo-300 bg-indigo-500/10 rounded-full px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    {isPlaying ? "Now playing" : "Up next"} · {current.niche}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {currentIndex + 1}/{filtered.length}
                  </span>
                </div>

                <h2 className="font-medium text-lg leading-snug">{current.headline}</h2>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 uppercase tracking-wide">{current.source}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-zinc-500">{current.minutesRead} min</span>
                  <span className="ml-auto text-zinc-500">{current.summary}</span>
                </div>

                {/* Waveform scrubber */}
                <div className="mt-4 flex items-end gap-[3px] h-12">
                  {bars.map((h, i) => {
                    const barPct = (i / bars.length) * 100;
                    const played = barPct <= progressPct;
                    return (
                      <span
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-sm ${played ? "bg-indigo-400" : "bg-zinc-700"}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>{formatTime(player.playingId === current.id ? player.elapsed : 0)}</span>
                  <span>
                    -{formatTime(player.duration > 0 && player.playingId === current.id ? player.duration - player.elapsed : estimateFallback(current))}
                  </span>
                </div>

                {!player.supported && (
                  <p className="mt-2 text-[11px] text-amber-400">
                    Speech synthesis isn't supported in this browser — playback progress is simulated only.
                  </p>
                )}

                <div className="mt-4 flex items-center justify-center gap-6">
                  <button
                    onClick={() => goTo(-1)}
                    className="h-9 w-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
                    aria-label="Previous brief"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-2xl transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <button
                    onClick={() => goTo(1)}
                    className="h-9 w-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
                    aria-label="Next brief"
                  >
                    ⏭
                  </button>
                </div>
              </article>
            ) : (
              <p className="mt-6 text-sm text-zinc-500">No stories in this category yet.</p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {filtered.map((brief, i) => (
                <button
                  key={brief.id}
                  onClick={() => {
                    player.stop();
                    setCurrentIndex(i);
                  }}
                  className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                    i === currentIndex
                      ? "border-indigo-500 bg-indigo-500/5"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wide text-zinc-500">{brief.niche}</span>
                    <span className="text-[10px] text-zinc-600">{brief.minutesRead} min</span>
                  </div>
                  <div className="text-sm font-medium leading-snug">{brief.headline}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function estimateFallback(brief: Brief): number {
  const words = `${brief.headline} ${brief.summary}`.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, (words / 155) * 60);
}
