"use client";

import Link from "next/link";
import { CATEGORIES, categoryVars, type Category, type Level } from "@/data/categories";
import { useProgress, statusOf } from "@/lib/progress";
import { wordsForCategory } from "@/lib/words";
import { Art, ProgressBar } from "./ui";

export function CategoryArt({ c, size = "md" }: { c: Category; size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <div className={`relative ${big ? "h-28 w-32" : "h-20 w-24"}`} aria-hidden>
      {/* soft "world" blob */}
      <svg viewBox="0 0 120 100" className="absolute inset-0 h-full w-full">
        <path
          d="M62 6c22 0 46 10 52 34s-6 48-30 54-52 2-68-14S2 38 16 22 40 6 62 6z"
          fill="var(--accent)"
          opacity="0.28"
        />
        <circle cx="104" cy="16" r="6" fill="var(--accent)" opacity="0.35" />
      </svg>
      <Art name={c.art[1]} className={`absolute ${big ? "left-0 top-12 h-11 w-11" : "left-0 top-8 h-8 w-8"} -rotate-12`} />
      <Art name={c.art[2]} className={`absolute ${big ? "right-0 top-0 h-10 w-10" : "right-0 top-0 h-7 w-7"} rotate-12`} />
      <Art name={c.art[0]} className={`absolute left-1/2 top-1/2 ${big ? "h-20 w-20" : "h-14 w-14"} -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_6px_rgba(37,36,66,0.15)]`} />
    </div>
  );
}

export function CategoryCard({ c, index, learned, total }: { c: Category; index: number; learned: number; total: number }) {
  const done = learned === total && total > 0;
  return (
    <Link
      href={`/category/${c.slug}`}
      style={categoryVars(c)}
      className="press focus-ring group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--soft)] p-4 [--edge:color-mix(in_srgb,var(--accent)_45%,transparent)] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <CategoryArt c={c} />
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-extrabold text-[var(--deep)]">{index + 1}</span>
      </div>
      <p className="font-ka mt-3 text-[0.98rem] font-extrabold leading-snug text-ink">{c.ka}</p>
      <p className="font-display text-xs font-medium text-[var(--deep)]">{c.name}</p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        <ProgressBar value={learned} max={total} color="var(--accent)" track="rgb(255 255 255 / 0.85)" height={10} />
        <span className="shrink-0 text-xs font-extrabold text-[var(--deep)]">
          {done ? <Art name="trophy" className="h-5 w-5" alt="დასრულებული" /> : `${learned}/${total}`}
        </span>
      </div>
    </Link>
  );
}

export default function CategoryGrid({ level }: { level?: Level }) {
  const [p] = useProgress();
  const list = level ? CATEGORIES.filter((c) => c.level === level) : CATEGORIES;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {list.map((c, i) => {
        const words = wordsForCategory(c.slug);
        const learned = words.filter((w) => statusOf(p, w.id) === "learned").length;
        return (
          <li key={c.slug} className="animate-rise" style={{ animationDelay: `${i * 35}ms` }}>
            <CategoryCard c={c} index={i} learned={learned} total={words.length} />
          </li>
        );
      })}
    </ul>
  );
}
