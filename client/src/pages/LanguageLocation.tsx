import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGUAGES = [
  { code: "en", flag: "\u{1F1EC}\u{1F1E7}", name: "English", subtitle: "Briefings delivered in English" },
  { code: "hi", flag: "\u{1F1EE}\u{1F1F3}", name: "हिन्दी", subtitle: "हिन्दी में समाचार सुनें" },
];

export default function LanguageLocation() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [locationEnabled, setLocationEnabled] = useState(false);

  function handleContinue() {
    localStorage.setItem("nuzio_language", language);
    localStorage.setItem("nuzio_location_enabled", String(locationEnabled));
    navigate("/login");
  }

  return (
    <div className="min-h-svh bg-[#0b0b0f] text-white flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold italic text-indigo-300">language</h1>
        <p className="mt-1 text-sm text-zinc-400 mb-6">Select the language for your daily brief.</p>

        <div className="flex flex-col gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                language === lang.code
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="font-medium">{lang.name}</div>
                <div className="text-xs text-zinc-400">{lang.subtitle}</div>
              </div>
              <span
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  language === lang.code ? "border-indigo-400" : "border-zinc-600"
                }`}
              >
                {language === lang.code && <span className="h-2 w-2 rounded-full bg-indigo-400" />}
              </span>
            </button>
          ))}

          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 mt-2">
            <span className="h-9 w-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">
              📍
            </span>
            <div className="flex-1">
              <div className="font-medium">Enable Location</div>
              <div className="text-xs text-zinc-400">Get hyperlocal news tailored to your city.</div>
              <div className="text-[10px] uppercase tracking-wide text-zinc-500 mt-1">
                {locationEnabled ? "Allowed" : "Not allowed"}
              </div>
            </div>
            <button
              onClick={() => setLocationEnabled((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                locationEnabled ? "bg-indigo-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  locationEnabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="mt-8 w-full rounded-xl bg-indigo-500 text-white font-medium py-3 hover:bg-indigo-400 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
