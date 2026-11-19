"use client";

import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { useProgress, statusOf } from "@/lib/progress";
import { wordsForCategory } from "@/lib/words";
import { ProgressBar } from "./ui";

export default function CategoryGrid() {
  const [p] = useProgress();
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CATEGORIES.map((c, i) => {
        const words = wordsForCategory(c.slug);
        const learned = words.filter((w) => statusOf(p, w.id) === "learned").length;
        const done = learned === words.length && words.length > 0;
        return (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className={`btn-3d relative flex h-full flex-col rounded-3xl bg-gradient-to-br ${c.bg} p-4 ring-2 ${c.ring} transition hover:-translate-y-0.5`}
            >
              <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 text-xs font-extrabold text-slate-500">{i + 1}</span>
              <span className="text-4xl drop-shadow-sm">{c.emoji}</span>
              <span className="font-ka mt-2 text-[0.95rem] font-extrabold leading-tight text-ink">{c.ka}</span>
              <span className="text-xs font-bold text-slate-500">{c.name}</span>
              <div className="mt-auto pt-3">
                <ProgressBar value={learned} max={words.length} color={c.bar} />
                <span className="mt-1 block text-xs font-extrabold text-slate-600">
                  {done ? "🏆 " : ""}
                  {learned}/{words.length}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
