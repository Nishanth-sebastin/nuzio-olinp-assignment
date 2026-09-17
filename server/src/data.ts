export type Niche =
  | "AI & Technology"
  | "Financial Markets"
  | "Indian Business"
  | "Global Politics"
  | "Startups"
  | "Science"
  | "Health & Medicine"
  | "Climate & Energy"
  | "Sports"
  | "Culture & Arts"
  | "Legal & Policy";

export const NICHES: Niche[] = [
  "AI & Technology",
  "Financial Markets",
  "Indian Business",
  "Global Politics",
  "Startups",
  "Science",
  "Health & Medicine",
  "Climate & Energy",
  "Sports",
  "Culture & Arts",
  "Legal & Policy",
];

export interface Voice {
  id: string;
  name: string;
  style: string;
  accent: string;
}

export const VOICES: Voice[] = [
  { id: "aria", name: "Aria", style: "Warm, Unhurried", accent: "British" },
  { id: "kai", name: "Kai", style: "Crisp, Focused", accent: "American" },
  { id: "meera", name: "Meera", style: "Bright, Curious", accent: "Indian" },
];

export const BRIEF_LENGTHS = [5, 10, 15] as const;

export interface Brief {
  id: string;
  niche: Niche;
  headline: string;
  summary: string;
  source: string;
  minutesRead: number;
}

export const BRIEFS: Brief[] = [
  {
    id: "b1",
    niche: "AI & Technology",
    headline: "Anthropic ships Claude 4.5 with 2M-token memory and native tools",
    summary:
      "The new model extends context window limits significantly and adds native tool-use APIs aimed at agentic workflows.",
    source: "TechCrunch",
    minutesRead: 3,
  },
  {
    id: "b2",
    niche: "Indian Business",
    headline: "India's UPI transaction volume crosses 18 billion in a single month",
    summary:
      "Digital payments continue to accelerate as UPI cements its position as the dominant retail payment rail in India.",
    source: "Economic Times",
    minutesRead: 2,
  },
  {
    id: "b3",
    niche: "Startups",
    headline: "Seed-stage funding rebounds in Q3 as investors return to early bets",
    summary:
      "After two quarters of caution, early-stage capital is flowing again, with AI-native startups capturing outsized share.",
    source: "YourStory",
    minutesRead: 3,
  },
  {
    id: "b4",
    niche: "Financial Markets",
    headline: "Nifty 50 closes at a fresh high as IT and banking stocks rally",
    summary:
      "Broad-based buying across index heavyweights pushed benchmark indices to a new record close.",
    source: "Moneycontrol",
    minutesRead: 2,
  },
  {
    id: "b5",
    niche: "Science",
    headline: "New battery chemistry promises 40% higher energy density",
    summary:
      "Researchers demonstrate a lab-scale solid-state cell that could meaningfully extend EV range if it scales to production.",
    source: "Nature News",
    minutesRead: 4,
  },
  {
    id: "b6",
    niche: "Health & Medicine",
    headline: "WHO flags rising antibiotic resistance across South Asia",
    summary:
      "A new report calls for tighter prescription controls as resistant infections climb in hospital settings.",
    source: "Reuters Health",
    minutesRead: 3,
  },
  {
    id: "b7",
    niche: "Climate & Energy",
    headline: "Rooftop solar additions in India cross 15 GW cumulative capacity",
    summary:
      "Falling panel costs and state subsidy schemes are driving a sharp uptick in residential adoption.",
    source: "Mercom India",
    minutesRead: 2,
  },
  {
    id: "b8",
    niche: "Global Politics",
    headline: "Trade talks resume between two major blocs after a six-month pause",
    summary:
      "Negotiators signal cautious optimism on tariff reductions covering technology and agricultural goods.",
    source: "Reuters",
    minutesRead: 3,
  },
];
