"use client";

import { useState } from "react";
import type { ContentType, Era, Language, MinRating, Mood, Preferences } from "@/lib/types";

const MOOD_OPTIONS: Array<{ value: Mood; label: string }> = [
  { value: "light_fun", label: "Light & fun" },
  { value: "intense_gripping", label: "Intense & gripping" },
  { value: "scary", label: "Scary" },
  { value: "romantic", label: "Romantic" },
  { value: "other", label: "Other" },
];

const LANGUAGE_OPTIONS: Array<{ value: Language; label: string }> = [
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "kannada", label: "Kannada" },
  { value: "any", label: "Any" },
];

const ERA_OPTIONS: Array<{ value: Era; label: string }> = [
  { value: "any", label: "Any" },
  { value: "classic", label: "Classic (pre-2000)" },
  { value: "2000_2020", label: "2000–2020" },
  { value: "recent", label: "Recent (2021–2026)" },
];

const RATING_OPTIONS: MinRating[] = [6, 7, 8, 9];

const DEFAULT_PREFS: Preferences = {
  moods: [],
  moodText: "",
  languages: [],
  contentType: "include_series",
  minRating: 7,
  eras: [],
};

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        selected
          ? "border-sage-500 bg-sage-500/20 text-sage-400"
          : "border-plum-600 bg-plum-800/50 text-cream-muted hover:border-sage-600"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-cream-100">{title}</h2>
      {children}
    </section>
  );
}

export function PreferenceForm({
  partnerLabel,
  onSubmit,
  submitting,
}: {
  partnerLabel: string;
  onSubmit: (prefs: Preferences) => void;
  submitting: boolean;
}) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  function toggleMood(value: Mood) {
    setPrefs((p) => ({
      ...p,
      moods: p.moods.includes(value) ? p.moods.filter((m) => m !== value) : [...p.moods, value],
    }));
  }

  function toggleLanguage(value: Language) {
    setPrefs((p) => {
      if (value === "any") return { ...p, languages: p.languages.includes("any") ? [] : ["any"] };
      const withoutAny = p.languages.filter((l) => l !== "any");
      const next = withoutAny.includes(value) ? withoutAny.filter((l) => l !== value) : [...withoutAny, value];
      return { ...p, languages: next };
    });
  }

  function toggleEra(value: Era) {
    setPrefs((p) => {
      if (value === "any") return { ...p, eras: p.eras.includes("any") ? [] : ["any"] };
      const withoutAny = p.eras.filter((e) => e !== "any");
      const next = withoutAny.includes(value) ? withoutAny.filter((e) => e !== value) : [...withoutAny, value];
      return { ...p, eras: next };
    });
  }

  const canSubmit = prefs.moods.length > 0 && prefs.languages.length > 0 && prefs.eras.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(prefs);
      }}
      className="space-y-8"
    >
      <div>
        <p className="text-sm uppercase tracking-wide text-sage-500">{partnerLabel}</p>
        <h1 className="font-display text-3xl text-cream-100">What are you in the mood for?</h1>
      </div>

      <Section title="Mood">
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <Chip key={opt.value} selected={prefs.moods.includes(opt.value)} onClick={() => toggleMood(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
        <textarea
          value={prefs.moodText}
          onChange={(e) => setPrefs((p) => ({ ...p, moodText: e.target.value }))}
          placeholder="Describe what you're in the mood for tonight (optional)"
          rows={3}
          className="w-full rounded-2xl border border-plum-600 bg-plum-800/50 p-4 text-cream-100 placeholder:text-cream-muted focus:border-sage-500 focus:outline-none"
        />
      </Section>

      <Section title="Language">
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((opt) => (
            <Chip key={opt.value} selected={prefs.languages.includes(opt.value)} onClick={() => toggleLanguage(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Content type">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "movies_only", label: "Movies only" },
              { value: "include_series", label: "Include series" },
            ] as Array<{ value: ContentType; label: string }>
          ).map((opt) => (
            <Chip
              key={opt.value}
              selected={prefs.contentType === opt.value}
              onClick={() => setPrefs((p) => ({ ...p, contentType: opt.value }))}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Minimum IMDb rating">
        <div className="flex flex-wrap items-center gap-2">
          {RATING_OPTIONS.map((r) => (
            <Chip key={r} selected={prefs.minRating === r} onClick={() => setPrefs((p) => ({ ...p, minRating: r }))}>
              {r}+
            </Chip>
          ))}
          {prefs.minRating === 9 && <span className="text-xs text-peach-500">very few titles</span>}
        </div>
      </Section>

      <Section title="Era">
        <div className="flex flex-wrap gap-2">
          {ERA_OPTIONS.map((opt) => (
            <Chip key={opt.value} selected={prefs.eras.includes(opt.value)} onClick={() => toggleEra(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </Section>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="w-full rounded-full bg-gold-500 py-4 font-display text-lg font-semibold text-plum-950 transition-opacity disabled:opacity-40"
      >
        {submitting ? "Saving…" : "I'm ready"}
      </button>
      {!canSubmit && (
        <p className="text-center text-xs text-cream-muted">Pick at least one mood, language, and era to continue.</p>
      )}
    </form>
  );
}
