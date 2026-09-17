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

## Screens implemented

- Login (Google sign-in, stubbed)
- Onboarding: niche picker, narrator voice picker, brief-length picker
- Home feed: personalized news briefs based on saved preferences
