import { COLOR_SWATCH } from "@/data/emoji";
import type { Word } from "@/lib/words";
import { hasAsset } from "@/lib/assets";

const SIZES = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-36 w-36 sm:h-44 sm:w-44",
  xl: "h-44 w-44 sm:h-52 sm:w-52",
};

/**
 * Word illustration with a fallback chain:
 *   1. public/images/NNN.webp   – final artwork (when added)
 *   2. public/art/words/NNN.svg – consistent placeholder illustration
 *   3. paint splash             – colour words
 */
export default function WordArt({ word, size = "md", className = "" }: { word: Word; size?: keyof typeof SIZES; className?: string }) {
  const dim = SIZES[size];
  const swatch = COLOR_SWATCH[word.id];

  if (hasAsset(word.image)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={word.image} alt={word.en} className={`${dim} object-contain ${className}`} draggable={false} />;
  }

  if (swatch) {
    const light = swatch === "#FFFFFF";
    return (
      <div className={`${dim} ${className}`} aria-label={word.en} role="img">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <ellipse cx="50" cy="92" rx="30" ry="4" fill="#252442" opacity="0.07" />
          <path
            d="M50 8c11 0 15 9 23 10s19 2 20 15-8 15-6 24 6 17-4 25-18 2-27 6-14 9-25 4S21 79 14 73 3 60 7 48 7 28 14 21s17-5 24-9 4-4 12-4z"
            fill={swatch}
            stroke={light ? "#d8d4e6" : "rgba(37,36,66,0.10)"}
            strokeWidth="2.5"
          />
          <ellipse cx="35" cy="32" rx="10" ry="6" fill="#fff" opacity="0.4" transform="rotate(-20 35 32)" />
          <circle cx="78" cy="22" r="4" fill={swatch} stroke={light ? "#d8d4e6" : "none"} strokeWidth="1.5" />
          <circle cx="86" cy="78" r="3" fill={swatch} stroke={light ? "#d8d4e6" : "none"} strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  const art = `/art/words/${String(word.id).padStart(3, "0")}.svg`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={art} alt={word.en} className={`${dim} object-contain drop-shadow-[0_6px_8px_rgba(37,36,66,0.12)] ${className}`} draggable={false} />;
}
