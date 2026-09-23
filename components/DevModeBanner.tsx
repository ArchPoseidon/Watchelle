"use client";

import { useEffect, useState } from "react";

interface Config {
  supabaseConfigured: boolean;
  tmdbConfigured: boolean;
  claudeConfigured: boolean;
  streamingConfigured: boolean;
}

export function DevModeBanner() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  if (!config) return null;
  const missing = Object.entries(config)
    .filter(([, v]) => !v)
    .map(([k]) => k.replace("Configured", ""));
  if (missing.length === 0) return null;

  return (
    <div className="bg-peach-600/20 px-4 py-2 text-center text-xs text-peach-400">
      Dev mode — no key yet for: {missing.join(", ")}. Using sample data / limited features.
    </div>
  );
}
