import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { DevModeBanner } from "@/components/DevModeBanner";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Watchélle",
  description:
    "The two-person movie & show matchmaker. Swipe together, find the one thing you both actually want to watch tonight.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <DevModeBanner />
        {children}
      </body>
    </html>
  );
}
