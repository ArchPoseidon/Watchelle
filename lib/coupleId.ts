"use client";

const KEY = "watchelle_couple_id";

/** Partner A's device remembers its couple id so returning visits pull history. */
export function getStoredCoupleId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setStoredCoupleId(coupleId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, coupleId);
}
