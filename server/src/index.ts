import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import { randomUUID } from "crypto";
import { NICHES, VOICES, BRIEF_LENGTHS, BRIEFS } from "./data";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- In-memory "database" (assignment scope — no real DB needed) ---

interface User {
  id: string;
  name: string;
  email: string;
}

interface Preferences {
  niches: string[];
  voiceId: string;
  briefLength: number;
}

const usersByToken = new Map<string, User>();
const preferencesByUserId = new Map<string, Preferences>();

// --- Auth middleware ---

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const user = token ? usersByToken.get(token) : undefined;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  (req as Request & { user: User }).user = user;
  next();
}

// --- Auth routes ---
// Real Google OAuth is out of scope for a 1-day take-home; this simulates the
// post-OAuth step (Google normally hands back a verified name/email/picture,
// which is what this endpoint stands in for) so the rest of the app — session
// handling, protected routes — is real, working code.

app.post("/api/auth/google", (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user: User = { id: randomUUID(), name, email };
  const token = randomUUID();
  usersByToken.set(token, user);

  return res.json({ token, user });
});

app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
  const { user } = req as Request & { user: User };
  res.json({ user });
});

// --- Onboarding options ---

app.get("/api/options", (_req: Request, res: Response) => {
  res.json({ niches: NICHES, voices: VOICES, briefLengths: BRIEF_LENGTHS });
});

// --- Preferences ---

app.get("/api/preferences", requireAuth, (req: Request, res: Response) => {
  const { user } = req as Request & { user: User };
  const prefs = preferencesByUserId.get(user.id) ?? null;
  res.json({ preferences: prefs });
});

app.put("/api/preferences", requireAuth, (req: Request, res: Response) => {
  const { user } = req as Request & { user: User };
  const { niches, voiceId, briefLength } = req.body as Partial<Preferences>;

  if (!Array.isArray(niches) || niches.length === 0) {
    return res.status(400).json({ error: "Select at least one niche" });
  }
  if (!voiceId || !VOICES.some((v) => v.id === voiceId)) {
    return res.status(400).json({ error: "Invalid voiceId" });
  }
  if (!briefLength || !BRIEF_LENGTHS.includes(briefLength as (typeof BRIEF_LENGTHS)[number])) {
    return res.status(400).json({ error: "Invalid briefLength" });
  }

  const prefs: Preferences = { niches, voiceId, briefLength };
  preferencesByUserId.set(user.id, prefs);
  res.json({ preferences: prefs });
});

// --- Personalized briefs ---
// Personalization here is real: results are filtered by the user's saved
// niches. The *content* itself is a static, hand-written dataset rather than
// a live AI-generation pipeline — a deliberate, disclosed scope cut given the
// assignment's 1-day window (see README).

app.get("/api/briefs", requireAuth, (req: Request, res: Response) => {
  const { user } = req as Request & { user: User };
  const prefs = preferencesByUserId.get(user.id);

  if (!prefs) {
    return res.status(400).json({ error: "Complete onboarding first" });
  }

  const personalized = BRIEFS.filter((b) => prefs.niches.includes(b.niche));
  const voice = VOICES.find((v) => v.id === prefs.voiceId);

  res.json({
    voice,
    briefLengthMinutes: prefs.briefLength,
    briefs: personalized.length > 0 ? personalized : BRIEFS.slice(0, 3),
  });
});

// --- Serve the built React app in production (single-deploy setup) ---

const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
// Express 5 dropped bare "*" wildcard routes (path-to-regexp v6) — a path-less
// app.use() fallback is the supported way to catch everything else for SPA routing.
app.use((_req: Request, res: Response) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Nuzio backend listening on http://localhost:${PORT}`);
});
