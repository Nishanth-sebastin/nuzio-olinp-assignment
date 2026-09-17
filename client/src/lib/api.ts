export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Voice {
  id: string;
  name: string;
  style: string;
  accent: string;
}

export interface Options {
  niches: string[];
  voices: Voice[];
  briefLengths: number[];
}

export interface Preferences {
  niches: string[];
  voiceId: string;
  briefLength: number;
}

export interface Brief {
  id: string;
  niche: string;
  headline: string;
  summary: string;
  source: string;
  minutesRead: number;
}

export interface BriefsResponse {
  voice: Voice;
  briefLengthMinutes: number;
  briefs: Brief[];
}

const TOKEN_KEY = "nuzio_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  loginWithGoogle: (name: string, email: string) =>
    request<{ token: string; user: User }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    }),
  me: () => request<{ user: User }>("/auth/me"),
  options: () => request<Options>("/options"),
  getPreferences: () => request<{ preferences: Preferences | null }>("/preferences"),
  savePreferences: (prefs: Preferences) =>
    request<{ preferences: Preferences }>("/preferences", {
      method: "PUT",
      body: JSON.stringify(prefs),
    }),
  getBriefs: () => request<BriefsResponse>("/briefs"),
};
