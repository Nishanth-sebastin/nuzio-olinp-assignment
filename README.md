# Nuzio AI — Olinp Assignment

Take-home assignment for the Full-Stack Developer (React/Node.js) role at Olinp Technology.

**Scope (per the brief):** frontend + backend for the login flow and the personalized-news home feed, based on the "Nuzio AI" Figma spec.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS (`client/`)
- **Backend:** Express + TypeScript (`server/`)
- **Database:** Postgres (Neon, serverless) via `pg`
- **Auth:** real Google OAuth 2.0 (authorization-code flow)

Two separate codebases matching the role's stated stack (React.js / Node.js) explicitly. In production, the Express server serves the built React app as static files, so the whole thing deploys as a single service.

## Running locally

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL + GOOGLE_CLIENT_ID/SECRET
npm run dev             # backend on http://localhost:4000

cd client
npm run build           # or `npm run dev` for hot-reload on :5173
```

The server serves the built client directly at `http://localhost:4000`, which is also the redirect URI registered with Google — that's the easiest way to exercise the real login flow locally.

### Environment variables (`server/.env`, gitignored)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth 2.0 credentials from Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | Must exactly match an authorized redirect URI on the OAuth client |
| `BASE_URL` | Used to build the post-login redirect back into the SPA |

If Google credentials aren't set, the backend falls back to a stubbed login form (enter any name/email) so the rest of the app can still be exercised without OAuth configured — `GET /api/config` tells the frontend which mode is active.

## Deliberate scope cuts (given the ~1-day window)

- **News content:** personalization is real — results are filtered server-side by the user's saved niches — but the underlying content is a small static dataset, not a live AI-generation pipeline.
- **Audio playback is real**, not simulated: "Play brief" uses the browser's native Web Speech API to actually read the headline + summary aloud, with a live elapsed/remaining timer and waveform progress synced to real speech duration (falls back to a time estimate only if the browser has no speech synthesis support).
- **Discover / Settings / Plan & billing** screens from the Figma file were intentionally not built — the brief asked only for "login and playing personalized news."

## Screens implemented

Matches the Figma flow order (`language` → `login` → onboarding → `morning brief`):

1. **Language & location** — language choice (English/Hindi) + location-permission toggle
2. **Login** — real Google OAuth sign-in
3. **Onboarding** — profession, niche picker (up to 7), narrator voice picker, brief-length picker
4. **All set** — confirmation screen with a "Brief Profile" summary (profession / niches / voice)
5. **Home (Morning Brief)** — category filter pills, date-stamped greeting, now-playing card with a real audio player (waveform scrubber, prev/next, elapsed/remaining timer), and the full story list below

## API

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/config` | Tells the frontend whether real Google OAuth is configured |
| GET | `/api/auth/google/start` | Redirects to Google's consent screen |
| GET | `/api/auth/google/callback` | Exchanges the auth code, upserts the user, creates a session |
| POST | `/api/auth/google` | Stub login fallback (only active when OAuth isn't configured) |
| GET | `/api/auth/me` | Current session user |
| GET | `/api/options` | Niches / voices / brief-length choices |
| GET`/`PUT | `/api/preferences` | Read/save the user's onboarding preferences |
| GET | `/api/briefs` | Personalized briefs, filtered by saved niches |

All data (users, sessions, preferences) is persisted in Postgres — verified to survive a full server restart.
