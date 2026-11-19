"use client";

import { LEVELS, type Level } from "@/data/categories";
import { progressActions, statusOf, useProgress } from "@/lib/progress";
import { wordsForLevel } from "@/lib/words";
import { Art, Ring } from "./ui";

const LEVEL_ART: Record<Level, string> = { 1: "seedling", 2: "rocket" };

/** Two big level cards; both levels are always open. */
export default function LevelSwitcher() {
  const [p, hydrated] = useProgress();
  const current = (hydrated ? p.level : undefined) ?? 1;
  return (
    <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="დონის არჩევა">
      {LEVELS.map(({ level, ka, sub }) => {
        const ws = wordsForLevel(level);
        const learned = hydrated ? ws.filter((w) => statusOf(p, w.id) === "learned").length : 0;
        const active = current === level;
        return (
          <button
            key={level}
            role="tab"
            aria-selected={active}
            onClick={() => progressActions.setLevel(level)}
            className={`press focus-ring relative flex items-center gap-3 overflow-hidden rounded-[1.5rem] p-3 text-left transition-colors ${
              active ? "bg-lavender text-white [--edge:#6a4fd0]" : "bg-white text-ink"
            }`}
          >
            <Ring
              value={learned}
              max={ws.length}
              size={54}
              stroke={7}
              color={active ? "#FFD85A" : "var(--color-lavender)"}
              track={active ? "rgb(255 255 255 / 0.25)" : "rgb(37 36 66 / 0.08)"}
            >
              <Art name={LEVEL_ART[level]} className="h-7 w-7" />
            </Ring>
            <span className="min-w-0">
              <span className="font-ka block text-base font-extrabold leading-tight">{ka}</span>
              <span className={`font-ka block text-[0.7rem] font-semibold ${active ? "text-white/85" : "text-ink-soft"}`}>{sub}</span>
              <span className="font-display block text-sm font-semibold" suppressHydrationWarning>
                {learned}/{ws.length}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
