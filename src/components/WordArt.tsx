import { COLOR_SWATCH, EMOJI } from "@/data/emoji";
import type { Word } from "@/lib/words";
import { hasAsset } from "@/lib/assets";

/**
 * Shows public/images/NNN.webp when it exists; otherwise a friendly emoji
 * (or a paint splash for colours). Drop real illustrations into
 * public/images/ and they appear automatically.
 */
export default function WordArt({ word, size = "md", className = "" }: { word: Word; size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "lg" ? "h-40 w-40 sm:h-48 sm:w-48" : size === "md" ? "h-24 w-24" : "h-14 w-14";
  const emojiSize = size === "lg" ? "text-[6.5rem] sm:text-[7.5rem]" : size === "md" ? "text-6xl" : "text-4xl";
  const swatch = COLOR_SWATCH[word.id];

  if (hasAsset(word.image)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={word.image}
        alt={word.en}
        className={`${dim} object-contain ${className}`}
        draggable={false}
      />
    );
  }

  if (swatch) {
    return (
      <div className={`${dim} flex items-center justify-center ${className}`} aria-label={word.en} role="img">
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md">
          <path
            d="M50 6c10 0 14 9 22 10s20 1 21 14-8 15-6 24 7 18-3 26-18 2-27 6-14 12-26 6S20 78 13 72 2 60 6 48s-1-20 6-28 18-6 25-10S40 6 50 6z"
            fill={swatch}
            stroke={swatch === "#FFFFFF" ? "#cbd5e1" : "rgba(0,0,0,0.12)"}
            strokeWidth="3"
          />
          <ellipse cx="36" cy="34" rx="10" ry="6" fill="white" opacity="0.45" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${dim} flex select-none items-center justify-center ${emojiSize} leading-none ${className}`} role="img" aria-label={word.en}>
      {EMOJI[word.id] ?? "✨"}
    </div>
  );
}
