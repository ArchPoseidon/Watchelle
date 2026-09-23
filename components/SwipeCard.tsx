"use client";

import Image from "next/image";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import { useState } from "react";
import type { Title } from "@/lib/types";

const SWIPE_THRESHOLD = 120;

function runtimeLabel(t: Title) {
  if (!t.runtimeMinutes) return null;
  if (t.mediaKind === "tv") return `${t.runtimeMinutes} min / ep`;
  const h = Math.floor(t.runtimeMinutes / 60);
  const m = t.runtimeMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function SwipeCard({
  title,
  isTop,
  onSwiped,
}: {
  title: Title;
  isTop: boolean;
  onSwiped: (direction: "right" | "left") => void;
}) {
  const controls = useAnimation();
  const [dragX, setDragX] = useState(0);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      controls.start({ x: 600, rotate: 20, opacity: 0, transition: { duration: 0.3 } }).then(() => onSwiped("right"));
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      controls.start({ x: -600, rotate: -20, opacity: 0, transition: { duration: 0.3 } }).then(() => onSwiped("left"));
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
      setDragX(0);
    }
  }

  const likeOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: isTop ? 10 : 1 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDrag={(_, info) => setDragX(info.offset.x)}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ scale: isTop ? 1 : 0.96, y: isTop ? 0 : 10 }}
      whileTap={{ cursor: "grabbing" }}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-plum-800 shadow-2xl shadow-black/40">
        <div className="relative flex-1 bg-gradient-to-br from-plum-700 to-plum-900">
          {title.posterUrl ? (
            <Image src={title.posterUrl} alt={title.name} fill className="object-cover" sizes="400px" priority={isTop} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-7xl text-sage-500/40">{title.name.charAt(0)}</span>
            </div>
          )}

          {isTop && (
            <>
              <div
                className="absolute left-6 top-6 rotate-[-12deg] rounded-lg border-4 border-sage-500 px-3 py-1 font-display text-2xl font-bold text-sage-500"
                style={{ opacity: likeOpacity }}
              >
                LIKE
              </div>
              <div
                className="absolute right-6 top-6 rotate-[12deg] rounded-lg border-4 border-clay-500 px-3 py-1 font-display text-2xl font-bold text-clay-500"
                style={{ opacity: passOpacity }}
              >
                PASS
              </div>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-950 via-plum-950/85 to-transparent p-5 pt-16">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl font-semibold text-cream-100">{title.name}</h3>
              {title.year && <span className="shrink-0 text-cream-muted">{title.year}</span>}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-peach-400">
              {title.rating != null && <span>★ {title.rating.toFixed(1)}</span>}
              {runtimeLabel(title) && <span>{runtimeLabel(title)}</span>}
              <span className="uppercase tracking-wide text-cream-muted">
                {title.mediaKind === "movie" ? "Movie" : "Series"}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-cream-muted">{title.synopsis}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
