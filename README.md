# Nuzio AI — Olinp Assignment

Take-home assignment for the Full-Stack Developer (React/Node.js) role at Olinp Technology.

**Scope (per the brief):** frontend + backend for the login flow and the personalized-news home feed, based on the "Nuzio AI" Figma spec.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS (`client/`)
- **Backend:** Express + TypeScript (`server/`)

Two separate codebases matching the role's stated stack (React.js / Node.js) explicitly. In production, the Express server serves the built React app as static files, so the whole thing deploys as a single service.

## Running locally

```bash
# backend (http://localhost:4000)
cd server && npm run dev

# frontend (http://localhost:5173, proxies /api to the backend)
cd client && npm run dev
```

## Deliberate scope cuts (given the ~1-day window)

- **Auth:** the "Continue with Google" flow is stubbed — the backend simulates the post-OAuth step (issuing a session for a name/email) rather than integrating real Google OAuth. Everything downstream (session handling, protected routes) is real.
- **News content:** personalization is real — results are filtered server-side by the user's saved niches — but the underlying content is a small static dataset, not a live AI-generation pipeline.
- **Audio playback is real**, not simulated: "Play brief" uses the browser's native Web Speech API to actually read the headline + summary aloud, with a live elapsed/remaining timer and waveform progress synced to real speech duration (falls back to a time estimate only if the browser has no speech synthesis support).
- **Discover / Settings / Plan & billing** screens from the Figma file were intentionally not built — the brief asked only for "login and playing personalized news."

## Screens implemented

Matches the Figma flow order (`language` → `login` → onboarding → `morning brief`):

1. **Language & location** — language choice (English/Hindi) + location-permission toggle
2. **Login** — Google sign-in (stubbed)
3. **Onboarding** — profession, niche picker (up to 7), narrator voice picker, brief-length picker
4. **All set** — confirmation screen with a "Brief Profile" summary (profession / niches / voice)
5. **Home (Morning Brief)** — category filter pills, date-stamped greeting, now-playing card with a real audio player (waveform scrubber, prev/next, elapsed/remaining timer), and the full story list below
