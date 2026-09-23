import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { HardFilters } from "./reconcile";
import type { Candidate } from "./tmdb";
import type { Preferences, SearchBrief, Title } from "./types";

const MODEL = "claude-sonnet-5";

export const isClaudeConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

const client = isClaudeConfigured
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const MOOD_LABELS: Record<string, string> = {
  light_fun: "Light & fun",
  intense_gripping: "Intense & gripping",
  scary: "Scary",
  romantic: "Romantic",
  other: "Other",
};

const MOOD_GENRE_HINTS: Record<string, string[]> = {
  light_fun: ["Comedy", "Family", "Adventure"],
  intense_gripping: ["Thriller", "Crime", "Action"],
  scary: ["Horror", "Mystery"],
  romantic: ["Romance", "Drama"],
  other: [],
};

const MOOD_TONE_WORDS: Record<string, string> = {
  light_fun: "light-hearted, feel-good",
  intense_gripping: "intense, high-stakes",
  scary: "scary, suspenseful",
  romantic: "romantic, warm",
  other: "",
};

/** Extracts a JSON object from a model response that may be fenced or chatty. */
function extractJson(raw: string): unknown {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) text = fenced[1].trim();
  try {
    return JSON.parse(text);
  } catch {
    // fall through
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }
  throw new Error("Claude response was not valid JSON");
}

async function askClaudeForJson(prompt: string): Promise<unknown> {
  if (!client) throw new Error("Claude is not configured");
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content.find((b) => b.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  return extractJson(raw);
}

function moodContext(prefs: Preferences): string {
  const labels = prefs.moods.map((m) => MOOD_LABELS[m] ?? m).join(", ") || "(none selected)";
  return `Mood chips: ${labels}\nFree text: "${prefs.moodText.trim() || "(none given)"}"`;
}

function fallbackBrief(hardFilters: HardFilters, a: Preferences, b: Preferences): SearchBrief {
  const moods = [...new Set([...a.moods, ...b.moods])];
  const genreHints = [...new Set(moods.flatMap((m) => MOOD_GENRE_HINTS[m] ?? []))];
  const toneKeywords = [...new Set(moods.map((m) => MOOD_TONE_WORDS[m]).filter(Boolean))];
  return {
    hardFilters,
    toneKeywords,
    genreHints,
    avoid: [],
    narrative: toneKeywords.length > 0
      ? `Looking for something ${toneKeywords.join(" and ")}.`
      : "Open to anything that fits the shared filters.",
  };
}

export async function generateInitialBrief(
  a: Preferences,
  b: Preferences,
  hardFilters: HardFilters,
  historyContext?: string
): Promise<SearchBrief> {
  if (!isClaudeConfigured) return fallbackBrief(hardFilters, a, b);

  const prompt = `You are helping two partners agree on a movie or show to watch tonight.
Each filled out an independent preference form. Turn their combined input into
a JSON search brief that captures the MOOD nuance a simple filter can't
(especially each person's free-text description). Do not restate the hard
filters below — those are already decided in code; your job is genre/tone
signal only.

Partner A:
${moodContext(a)}

Partner B:
${moodContext(b)}

Already-decided hard filters (context only, do not repeat in your answer):
${JSON.stringify(hardFilters)}
${historyContext ? `\nThis couple's history (bias gently toward what they've enjoyed before, don't ignore tonight's stated mood):\n${historyContext}\n` : ""}

Respond with ONLY a JSON object, no commentary, no markdown fences:
{
  "toneKeywords": ["3-6 short tone/mood descriptors that reconcile both partners' moods"],
  "genreHints": ["3-6 TMDB-style genre names likely to satisfy both, e.g. Comedy, Thriller"],
  "avoid": ["genres or tones to avoid, based on anything either partner's free text rules out"],
  "narrative": "one sentence describing what we're looking for tonight, in plain English"
}`;

  try {
    const data = (await askClaudeForJson(prompt)) as Partial<SearchBrief>;
    return {
      hardFilters,
      toneKeywords: Array.isArray(data.toneKeywords) ? data.toneKeywords : [],
      genreHints: Array.isArray(data.genreHints) ? data.genreHints : [],
      avoid: Array.isArray(data.avoid) ? data.avoid : [],
      narrative: typeof data.narrative === "string" ? data.narrative : "",
    };
  } catch {
    return fallbackBrief(hardFilters, a, b);
  }
}

export async function refineBriefForRound2(
  previousBrief: SearchBrief,
  rightSwipedByA: Title[],
  rightSwipedByB: Title[]
): Promise<SearchBrief> {
  const combined = [...rightSwipedByA, ...rightSwipedByB];
  if (!isClaudeConfigured || combined.length === 0) {
    const genreCounts = new Map<string, number>();
    for (const t of combined) {
      for (const g of t.genres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
    }
    const topGenres = [...genreCounts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([g]) => g);
    return {
      ...previousBrief,
      genreHints: topGenres.length > 0 ? topGenres : previousBrief.genreHints,
      narrative: topGenres.length > 0
        ? `Leaning into what worked last round: ${topGenres.join(", ")}.`
        : previousBrief.narrative,
    };
  }

  const describe = (t: Title) => `${t.name} (${t.genres.join("/")}) — ${t.synopsis}`;
  const prompt = `Two partners just swiped through a pool of 30 titles looking for one they'd
both watch tonight — no mutual match yet. Here is what each partner swiped
RIGHT on (liked), which is a much stronger signal than their original mood
chips. Update the search brief to lean into this demonstrated taste while
staying compatible with both people.

Partner A liked:
${rightSwipedByA.length > 0 ? rightSwipedByA.map(describe).join("\n") : "(swiped right on nothing)"}

Partner B liked:
${rightSwipedByB.length > 0 ? rightSwipedByB.map(describe).join("\n") : "(swiped right on nothing)"}

Previous brief: ${JSON.stringify(previousBrief)}

Respond with ONLY a JSON object, no commentary, no markdown fences:
{
  "toneKeywords": ["updated tone descriptors"],
  "genreHints": ["updated genre names, leaning into what was liked"],
  "avoid": ["updated avoid list"],
  "narrative": "one sentence describing the refined search"
}`;

  try {
    const data = (await askClaudeForJson(prompt)) as Partial<SearchBrief>;
    return {
      hardFilters: previousBrief.hardFilters,
      toneKeywords: Array.isArray(data.toneKeywords) ? data.toneKeywords : previousBrief.toneKeywords,
      genreHints: Array.isArray(data.genreHints) ? data.genreHints : previousBrief.genreHints,
      avoid: Array.isArray(data.avoid) ? data.avoid : previousBrief.avoid,
      narrative: typeof data.narrative === "string" ? data.narrative : previousBrief.narrative,
    };
  } catch {
    return previousBrief;
  }
}

function fallbackCurate(candidates: Candidate[], brief: SearchBrief, count: number): Candidate[] {
  const scored = candidates.map((c) => {
    const genreBonus = c.genres.some((g) => brief.genreHints.includes(g)) ? 2 : 0;
    const avoidPenalty = c.genres.some((g) => brief.avoid.includes(g)) ? -3 : 0;
    return { c, score: c.rating + genreBonus + avoidPenalty };
  });
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, count).map((s) => s.c);
}

/**
 * Claude's fuzzy layer on top of TMDB's hard-filtered candidates: picks and
 * ranks the best `count` titles using the brief's tone/genre signal and each
 * partner's raw free-text mood, which TMDB's own filters can't act on.
 */
export async function curateTitles(
  candidates: Candidate[],
  brief: SearchBrief,
  moodTextA: string,
  moodTextB: string,
  count: number
): Promise<Candidate[]> {
  if (candidates.length <= count) return candidates;
  if (!isClaudeConfigured) return fallbackCurate(candidates, brief, count);

  const listing = candidates
    .map((c) => `${c.id} | ${c.name} (${c.year ?? "?"}) | ${c.genres.join("/")} | rating ${c.rating} | ${c.synopsis.slice(0, 160)}`)
    .join("\n");

  const prompt = `Pick the best ${count} titles from this candidate list for two partners
watching together tonight. Both must plausibly enjoy each pick — this is a
compromise set, not just "best reviewed."

Search brief: ${JSON.stringify(brief)}
Partner A's own words: "${moodTextA.trim() || "(none given)"}"
Partner B's own words: "${moodTextB.trim() || "(none given)"}"

Candidates (id | name (year) | genres | rating | synopsis):
${listing}

Respond with ONLY a JSON object, no commentary, no markdown fences:
{ "selected_ids": ["ordered list of exactly ${count} ids, best match first, copied verbatim from the candidate ids above"] }`;

  try {
    const data = (await askClaudeForJson(prompt)) as { selected_ids?: unknown };
    const ids = Array.isArray(data.selected_ids) ? data.selected_ids.filter((x) => typeof x === "string") : [];
    const byId = new Map(candidates.map((c) => [c.id, c]));
    const selected = ids.map((id) => byId.get(id as string)).filter((c): c is Candidate => Boolean(c));

    if (selected.length < count) {
      const already = new Set(selected.map((c) => c.id));
      for (const c of fallbackCurate(candidates, brief, candidates.length)) {
        if (selected.length >= count) break;
        if (!already.has(c.id)) {
          selected.push(c);
          already.add(c.id);
        }
      }
    }
    return selected.slice(0, count);
  } catch {
    return fallbackCurate(candidates, brief, count);
  }
}
