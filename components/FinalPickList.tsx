"use client";

import Image from "next/image";
import type { Title } from "@/lib/types";

export function FinalPickList({
  titles,
  onPick,
  picking,
}: {
  titles: Title[];
  onPick: (title: Title) => void;
  picking: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-wide text-sage-500">No match yet</p>
        <h1 className="font-display text-3xl text-cream-100">Your top 5 — pick one together</h1>
        <p className="mt-1 text-cream-muted">
          These got the most love across both rounds. Talk it out and tap the one you’re both good with.
        </p>
      </div>

      <ul className="space-y-3">
        {titles.map((title) => (
          <li key={title.id}>
            <button
              disabled={picking}
              onClick={() => onPick(title)}
              className="flex w-full items-center gap-4 rounded-2xl border border-plum-600 bg-plum-800/50 p-3 text-left transition-colors hover:border-gold-500 disabled:opacity-50"
            >
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-plum-700">
                {title.posterUrl ? (
                  <Image src={title.posterUrl} alt={title.name} width={64} height={96} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-2xl text-sage-500/40">{title.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg text-cream-100">{title.name}</h3>
                <div className="flex items-center gap-2 text-xs text-peach-400">
                  {title.year && <span>{title.year}</span>}
                  {title.rating != null && <span>★ {title.rating.toFixed(1)}</span>}
                  <span className="uppercase tracking-wide text-cream-muted">
                    {title.mediaKind === "movie" ? "Movie" : "Series"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-cream-muted">{title.synopsis}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
