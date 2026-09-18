import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import { randomUUID } from "crypto";
import "dotenv/config";
import { NICHES, VOICES, BRIEF_LENGTHS, BRIEFS } from "./data";
import { getPool, initDb } from "./db";
import { googleOAuthConfigured, getGoogleAuthUrl, exchangeCodeForUser } from "./googleAuth";

const app = express();
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

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

async function createSession(userId: string): Promise<string> {
  const token = randomUUID();
  await getPool().query("INSERT INTO sessions (token, user_id) VALUES ($1, $2)", [token, userId]);
  return token;
}

async function getUserByToken(token: string): Promise<User | null> {
  const result = await getPool().query<User>(
    `SELECT u.id, u.name, u.email FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1`,
    [token],
  );
  return result.rows[0] ?? null;
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const user = token ? await getUserByToken(token) : null;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  (req as Request & { user: User }).user = user;
  next();
}

// --- Config (lets the frontend know whether real Google OAuth is wired up) ---

app.get("/api/config", (_req: Request, res: Response) => {
  res.json({ googleOAuthEnabled: googleOAuthConfigured });
});

// --- Auth: real Google OAuth (when configured) ---

app.get("/api/auth/google/start", (_req: Request, res: Response) => {
  if (!googleOAuthConfigured) {
    return res.status(400).json({ error: "Google OAuth is not configured on this server" });
  }
  res.redirect(getGoogleAuthUrl());
});

app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    const googleUser = await exchangeCodeForUser(code);

    const existing = await getPool().query<{ id: string }>(
      "SELECT id FROM users WHERE google_id = $1 OR email = $2",
      [googleUser.sub, googleUser.email],
    );

    let userId: string;
    if (existing.rows[0]) {
      userId = existing.rows[0].id;
      await getPool().query("UPDATE users SET google_id = $1, name = $2 WHERE id = $3", [
        googleUser.sub,
        googleUser.name,
        userId,
      ]);
    } else {
      userId = randomUUID();
      await getPool().query(
        "INSERT INTO users (id, name, email, google_id) VALUES ($1, $2, $3, $4)",
        [userId, googleUser.name, googleUser.email, googleUser.sub],
      );
    }

    const token = await createSession(userId);
    res.redirect(`${BASE_URL}/oauth/callback?token=${token}`);
  } catch (err) {
    console.error("Google OAuth callback failed:", err);
    res.redirect(`${BASE_URL}/login?error=oauth_failed`);
  }
});

// --- Auth: stubbed fallback (used only while Google OAuth isn't configured yet) ---

app.post("/api/auth/google", async (req: Request, res: Response) => {
  if (googleOAuthConfigured) {
    return res.status(400).json({ error: "Real Google OAuth is enabled - use /api/auth/google/start" });
  }

  const { name, email } = req.body as { name?: string; email?: string };
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const existing = await getPool().query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  let userId: string;
  if (existing.rows[0]) {
    userId = existing.rows[0].id;
  } else {
    userId = randomUUID();
    await getPool().query("INSERT INTO users (id, name, email) VALUES ($1, $2, $3)", [userId, name, email]);
  }

  const token = await createSession(userId);
  const user = { id: userId, name, email };
  res.json({ token, user });
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

app.get("/api/preferences", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as Request & { user: User };
  const result = await getPool().query<{ niches: string[]; voice_id: string; brief_length: number }>(
    "SELECT niches, voice_id, brief_length FROM preferences WHERE user_id = $1",
    [user.id],
  );
  const row = result.rows[0];
  const preferences: Preferences | null = row
    ? { niches: row.niches, voiceId: row.voice_id, briefLength: row.brief_length }
    : null;
  res.json({ preferences });
});

app.put("/api/preferences", requireAuth, async (req: Request, res: Response) => {
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

  await getPool().query(
    `INSERT INTO preferences (user_id, niches, voice_id, brief_length, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id) DO UPDATE SET niches = $2, voice_id = $3, brief_length = $4, updated_at = now()`,
    [user.id, niches, voiceId, briefLength],
  );

  res.json({ preferences: { niches, voiceId, briefLength } });
});

// --- Personalized briefs ---

app.get("/api/briefs", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as Request & { user: User };
  const result = await getPool().query<{ niches: string[]; voice_id: string; brief_length: number }>(
    "SELECT niches, voice_id, brief_length FROM preferences WHERE user_id = $1",
    [user.id],
  );
  const prefs = result.rows[0];

  if (!prefs) {
    return res.status(400).json({ error: "Complete onboarding first" });
  }

  const personalized = BRIEFS.filter((b) => prefs.niches.includes(b.niche));
  const voice = VOICES.find((v) => v.id === prefs.voice_id);

  res.json({
    voice,
    briefLengthMinutes: prefs.brief_length,
    briefs: personalized.length > 0 ? personalized : BRIEFS.slice(0, 3),
  });
});

// --- Serve the built React app in production (single-deploy setup) ---

const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.use((_req: Request, res: Response) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Nuzio backend listening on http://localhost:${PORT}`);
      console.log(`Google OAuth: ${googleOAuthConfigured ? "enabled" : "disabled (using stub login)"}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
