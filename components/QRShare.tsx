"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRShare({ joinUrl }: { joinUrl: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(joinUrl, {
      width: 480,
      margin: 2,
      color: { dark: "#241a29", light: "#faf3e7" },
    }).then(setQrDataUrl);
  }, [joinUrl]);

  useEffect(() => {
    // navigator.canShare with a dummy file is the standard feature-detect
    // for the Web Share API's file-sharing support.
    if (typeof navigator === "undefined" || !navigator.canShare) return;
    try {
      const probe = new File(["probe"], "probe.png", { type: "image/png" });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection needs `navigator`, only available post-mount
      setCanShareFiles(navigator.canShare({ files: [probe] }));
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  async function shareImage() {
    if (!qrDataUrl) return;
    const res = await fetch(qrDataUrl);
    const blob = await res.blob();
    const file = new File([blob], "watchelle-invite.png", { type: "image/png" });
    try {
      await navigator.share({
        title: "Watchélle — pick tonight's watch with me",
        text: "Scan this or tap the link to join my Watchélle session.",
        url: joinUrl,
        files: [file],
      });
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="rounded-3xl bg-cream-100 p-4 shadow-lg shadow-black/30">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QR code to join this Watchélle session" width={220} height={220} />
        ) : (
          <div className="h-[220px] w-[220px] animate-pulse rounded-xl bg-plum-700" />
        )}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {canShareFiles && (
          <button
            onClick={shareImage}
            className="w-full rounded-full bg-pink-500 py-3 font-display font-semibold text-plum-950"
          >
            Share QR to a messaging app
          </button>
        )}
        <button
          onClick={copyLink}
          className="w-full rounded-full border border-plum-600 py-3 text-cream-100 hover:border-sage-500"
        >
          {copied ? "Link copied" : "Copy join link instead"}
        </button>
      </div>
    </div>
  );
}
