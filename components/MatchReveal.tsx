"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { StreamingOffer, Title } from "@/lib/types";

const TYPE_LABEL: Record<StreamingOffer["type"], string> = {
  subscription: "Included",
  rent: "Rent",
  buy: "Buy",
  free: "Free",
};

export function MatchReveal({
  title,
  offers,
  loadingOffers,
  streamingConfigured,
}: {
  title: Title;
  offers: StreamingOffer[];
  loadingOffers: boolean;
  streamingConfigured: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-sm uppercase tracking-[0.3em] text-gold-500"
      >
        It’s a match
      </motion.div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="relative"
      >
        <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-gold-500/25 blur-3xl" />
        <div className="h-72 w-48 overflow-hidden rounded-2xl border-4 border-gold-500/60 bg-plum-800 shadow-2xl shadow-black/50">
          {title.posterUrl ? (
            <Image src={title.posterUrl} alt={title.name} width={192} height={288} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-6xl text-sage-500/40">{title.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-sm space-y-2">
        <h1 className="font-display text-3xl font-semibold text-cream-100">{title.name}</h1>
        <div className="flex items-center justify-center gap-3 text-sm text-peach-400">
          {title.year && <span>{title.year}</span>}
          {title.rating != null && <span>★ {title.rating.toFixed(1)}</span>}
          {title.runtimeMinutes && <span>{title.runtimeMinutes} min{title.mediaKind === "tv" ? "/ep" : ""}</span>}
          <span className="uppercase tracking-wide text-cream-muted">{title.mediaKind === "movie" ? "Movie" : "Series"}</span>
        </div>
        <p className="text-cream-muted">{title.synopsis}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="w-full max-w-sm space-y-3">
        <h2 className="font-display text-lg text-cream-100">Watch it now in India</h2>
        {!streamingConfigured ? (
          <p className="rounded-2xl border border-plum-600 bg-plum-800/50 p-4 text-sm text-cream-muted">
            Add a RapidAPI Streaming Availability key to see where to watch.
          </p>
        ) : loadingOffers ? (
          <p className="text-sm text-cream-muted">Checking platforms…</p>
        ) : offers.length === 0 ? (
          <p className="rounded-2xl border border-plum-600 bg-plum-800/50 p-4 text-sm text-cream-muted">
            Couldn’t find a streaming source for this title right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {offers.map((offer) => (
              <li key={`${offer.platform}-${offer.type}`}>
                <a
                  href={offer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-plum-600 bg-plum-800/50 px-4 py-3 text-cream-100 hover:border-sage-500"
                >
                  <span className="font-medium">{offer.platform}</span>
                  <span className="text-sm text-sage-400">{TYPE_LABEL[offer.type]} →</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
