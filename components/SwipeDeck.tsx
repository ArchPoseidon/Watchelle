"use client";

import { useState } from "react";
import { SwipeCard } from "./SwipeCard";
import type { Title } from "@/lib/types";

export function SwipeDeck({
  titles,
  onSwipe,
  onExhausted,
}: {
  titles: Title[];
  onSwipe: (title: Title, direction: "right" | "left") => void;
  onExhausted: () => void;
}) {
  const [index, setIndex] = useState(0);
  const visible = titles.slice(index, index + 3);
  const done = index >= titles.length;

  function advance(direction: "right" | "left") {
    const title = titles[index];
    onSwipe(title, direction);
    const next = index + 1;
    setIndex(next);
    if (next >= titles.length) onExhausted();
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-2xl text-cream-100">That’s everyone!</p>
        <p className="text-cream-muted">Waiting to see if you two matched on something…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between text-sm text-cream-muted">
        <span>
          {index + 1} / {titles.length}
        </span>
      </div>

      <div className="relative flex-1">
        {visible
          .map((title, i) => (
            <SwipeCard key={title.id} title={title} isTop={i === 0} onSwiped={(dir) => advance(dir)} />
          ))
          .reverse()}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          onClick={() => advance("left")}
          aria-label="Pass"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-clay-500 text-3xl text-clay-500 active:scale-95"
        >
          ✕
        </button>
        <button
          onClick={() => advance("right")}
          aria-label="Like"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-pink-500 text-3xl text-pink-500 active:scale-95"
        >
          ♥
        </button>
      </div>
    </div>
  );
}
