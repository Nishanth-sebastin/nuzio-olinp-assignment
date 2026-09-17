import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Options } from "../lib/api";

const MAX_NICHES = 7;

export default function Onboarding() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<Options | null>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
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

  return (
    <div className="min-h-svh bg-[#0b0b0f] text-white flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">
        {step === 0 && (
          <StepShell title="What's your profession?" subtitle="We'll tune every brief to what actually moves your day.">
            <div className="flex flex-wrap gap-2 justify-center">
              {["Finance & Trading", "Legal", "Technology", "Healthcare", "Consulting", "Marketing & Media", "Government & Policy", "Real Estate", "Sports", "Culture & Arts", "Education", "Legal & Policy"].map(
                (p) => (
                  <Chip key={p} label={p} disabled />
                ),
              )}
            </div>
            <p className="mt-4 text-xs text-zinc-500 text-center">
              (Profession is illustrative only for this assignment — niche selection below drives personalization.)
            </p>
            <PrimaryButton onClick={() => setStep(1)}>Continue →</PrimaryButton>
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
              {saving ? "Saving..." : "Continue with " + (options.voices.find((v) => v.id === voiceId)?.name ?? "…")}
            </PrimaryButton>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="You're ready." subtitle="Your first brief will be ready tomorrow at 7:00 AM. We're already curating.">
            <div className="flex justify-center my-6">
              <div className="h-16 w-16 rounded-full border-2 border-indigo-500 flex items-center justify-center text-indigo-400 text-2xl">
                ✓
              </div>
            </div>
            <PrimaryButton onClick={() => navigate("/home")}>Go to my feed →</PrimaryButton>
          </StepShell>
        )}
      </div>
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
