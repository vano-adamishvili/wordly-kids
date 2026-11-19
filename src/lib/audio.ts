"use client";

import { hasAsset } from "@/lib/assets";

let current: HTMLAudioElement | null = null;

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => /en-US/i.test(v.lang) && /(Samantha|Google US|Jenny|Aria|Female)/i.test(v.name)) ??
    voices.find((v) => /en-US/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang))
  );
}

/** Speak English text with the browser's built-in voice. */
export function speak(text: string, rate = 0.85): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  u.pitch = 1.1;
  const v = pickVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
  return true;
}

/**
 * Play a recorded file if it exists (public/audio/...), otherwise fall back to TTS.
 * Returns a promise resolving to "file" | "tts" | "none".
 */
export async function playEnglish(src: string, fallbackText: string): Promise<"file" | "tts" | "none"> {
  const ok = await tryPlay(src);
  if (ok) return "file";
  return speak(fallbackText) ? "tts" : "none";
}

/** Try to play a recorded file. Resolves false if missing / blocked. */
const missing = new Set<string>();

export function tryPlay(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!hasAsset(src) || missing.has(src)) return resolve(false);
    try {
      current?.pause();
      window.speechSynthesis?.cancel();
      const a = new Audio(src);
      current = a;
      let settled = false;
      const done = (v: boolean, isMissing = false) => {
        if (!settled) {
          settled = true;
          if (!v) a.pause();
          if (isMissing) missing.add(src);
          resolve(v);
        }
      };
      a.addEventListener("error", () => done(false, true), { once: true });
      a.play().then(() => done(true)).catch(() => done(false));
      setTimeout(() => done(false), 2500);
    } catch {
      resolve(false);
    }
  });
}

// Warm up the voices list (Chrome loads them asynchronously)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
}
