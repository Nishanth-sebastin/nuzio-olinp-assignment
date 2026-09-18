import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Options } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const MAX_NICHES = 7;

const PROFESSIONS = [
  "Finance & Trading",
  "Legal",
  "Technology",
  "Healthcare",
  "Consulting",
  "Marketing & Media",
  "Government & Policy",
  "Real Estate",
  "Sports",
  "Culture & Arts",
  "Education",
  "Legal & Policy",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [options, setOptions] = useState<Options | null>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [profession, setProfession] = useState<string | null>(null);
  const [niches, setNiches] = useState<string[]>([]);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [briefLength, setBriefLength] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.options().then(setOptions);
  }, []);

  function toggleNiche(n: string) {
    setNiches((prev) =>
      prev.includes(n)
        ? prev.filter((x) => x !== n)
        : prev.length < MAX_NICHES
          ? [...prev, n]
          : prev,
    );
  }

  async function finish() {
    if (!voiceId || !briefLength) return;
    setSaving(true);
    setError(null);
    try {
      await api.savePreferences({ niches, voiceId, briefLength });
      if (profession) localStorage.setItem("nuzio_profession", profession);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (!options) {
    return <div className="min-h-svh bg-[#0b0b0f]" />;
  }

  const selectedVoice = options.voices.find((v) => v.id === voiceId);
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="min-h-svh bg-[#0b0b0f] text-white flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">
        {step === 0 && (
          <StepShell title="What's your profession?" subtitle="We'll tune every brief to what actually moves your day.">
            <div className="flex flex-wrap gap-2 justify-center">
              {PROFESSIONS.map((p) => (
                <Chip key={p} label={p} selected={profession === p} onClick={() => setProfession(p)} />
              ))}
            </div>
            <PrimaryButton onClick={() => setStep(1)} disabled={!profession}>
              Continue →
            </PrimaryButton>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            title="What moves your world?"
            subtitle={`Pick up to ${MAX_NICHES} niches. (${niches.length}/${MAX_NICHES})`}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {options.niches.map((n) => (
                <Chip key={n} label={n} selected={niches.includes(n)} onClick={() => toggleNiche(n)} />
              ))}
            </div>
            <PrimaryButton onClick={() => setStep(2)} disabled={niches.length === 0}>
              Continue →
            </PrimaryButton>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Pick a narrator voice." subtitle="Tap to preview the style.">
            <div className="flex flex-col gap-3">
              {options.voices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    voiceId === v.id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-semibold">
                    {v.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-zinc-400">
                      {v.style} · {v.accent}
                    </div>
                  </div>
                  {voiceId === v.id && <span className="text-indigo-400 text-sm">✓</span>}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-center text-sm text-zinc-400 mb-3">How long is your morning?</p>
              <div className="flex justify-center gap-2">
                {options.briefLengths.map((len) => (
                  <button
                    key={len}
                    onClick={() => setBriefLength(len)}
                    className={`rounded-full px-4 py-2 text-sm border transition-colors ${
                      briefLength === len
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                        : "border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {len} min
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

            <PrimaryButton onClick={finish} disabled={!voiceId || !briefLength || saving}>
              {saving ? "Saving..." : "Continue with " + (selectedVoice?.name ?? "…")}
            </PrimaryButton>
          </StepShell>
        )}

        {step === 3 && (
          <div>
            <p className="text-center text-xs uppercase tracking-wide text-emerald-400 mb-2">✓ All set</p>
            <h1 className="text-2xl font-semibold text-center">
              You're ready, <span className="text-emerald-400 italic">{firstName}</span>.
            </h1>
            <p className="mt-2 text-sm text-zinc-400 text-center">
              Your first brief will be ready tomorrow at 7:00 AM. We're already curating.
            </p>

            <div className="flex justify-center my-6">
              <div className="h-16 w-16 rounded-full border-2 border-indigo-500 flex items-center justify-center text-emerald-400 text-2xl">
                ✓
              </div>
            </div>

            <p className="text-xs uppercase tracking-wide text-indigo-400 mb-2">Your brief profile</p>
            <div className="flex flex-col gap-2 mb-8">
              <ProfileRow icon="💼" label="Profession" value={profession ?? "Not set"} />
              <ProfileRow
                icon="✨"
                label="Niches"
                value={
                  niches.length > 2
                    ? `${niches.slice(0, 2).join(", ")} +${niches.length - 2}`
                    : niches.join(", ")
                }
              />
              <ProfileRow
                icon="🎧"
                label="Voice"
                value={selectedVoice ? `${selectedVoice.name} — ${selectedVoice.accent}, ${selectedVoice.style.toLowerCase()}` : "Not set"}
              />
            </div>

            <PrimaryButton onClick={() => navigate("/home")}>Go to my feed →</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <span className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center text-base">{icon}</span>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
        <div className="font-medium text-sm">{value}</div>
      </div>
      <span className="text-emerald-400 text-sm">✓</span>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-center">{title}</h1>
      <p className="mt-1 text-sm text-zinc-400 text-center mb-8">{subtitle}</p>
      {children}
    </div>
  );
}

function Chip({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        selected
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
          : "border-zinc-800 text-zinc-300 hover:border-zinc-700 disabled:opacity-40 disabled:hover:border-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-8 w-full rounded-xl bg-indigo-500 text-white font-medium py-3 hover:bg-indigo-400 transition-colors disabled:opacity-40 disabled:hover:bg-indigo-500"
    >
      {children}
    </button>
  );
}
