"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/data/categories";
import { progressActions, statusOf, streak, useProgress } from "@/lib/progress";
import { WORDS, wordsForCategory } from "@/lib/words";
import { ProgressBar, TopBar } from "./ui";

const BADGES = [
  { need: 1, icon: "🌱", ka: "პირველი სიტყვა" },
  { need: 10, icon: "🐣", ka: "10 სიტყვა" },
  { need: 30, icon: "🚀", ka: "30 სიტყვა" },
  { need: 60, icon: "🦸", ka: "60 სიტყვა" },
  { need: 120, icon: "👑", ka: "ყველა 120!" },
];

export default function ProgressView() {
  const [p] = useProgress();
  const [confirm, setConfirm] = useState(false);
  const counts = { new: 0, learning: 0, learned: 0 };
  WORDS.forEach((w) => counts[statusOf(p, w.id)]++);

  return (
    <main>
      <TopBar back="/" title="⭐ ჩემი პროგრესი" />
      <div className="space-y-5 px-4">
        <section className="grid grid-cols-3 gap-2 text-center">
          <Box icon="⭐" value={p.stars} label="ვარსკვლავი" />
          <Box icon="📗" value={counts.learned} label="ნასწავლი" />
          <Box icon="🔥" value={streak(p)} label="დღე ზედიზედ" />
        </section>

        <section className="rounded-[2rem] bg-white p-4 ring-1 ring-violet-100">
          <p className="font-ka mb-2 font-extrabold">120 სიტყვიდან</p>
          <div className="flex h-5 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${(counts.learned / 120) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(counts.learning / 120) * 100}%` }} />
          </div>
          <div className="font-ka mt-2 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
            <span>🟢 ნასწავლი: {counts.learned}</span>
            <span>🟡 ვსწავლობ: {counts.learning}</span>
            <span>⚪ ახალი: {counts.new}</span>
          </div>
        </section>

        <section>
          <p className="font-ka mb-2 font-extrabold">🏅 ჯილდოები</p>
          <div className="grid grid-cols-5 gap-2">
            {BADGES.map((b) => {
              const got = counts.learned >= b.need;
              return (
                <div key={b.need} className={`rounded-2xl p-2 text-center ${got ? "bg-amber-100 ring-2 ring-amber-300" : "bg-white opacity-50 ring-1 ring-slate-200"}`}>
                  <div className={`text-3xl ${got ? "" : "grayscale"}`}>{b.icon}</div>
                  <div className="font-ka text-[0.65rem] font-bold leading-tight">{b.ka}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="font-ka mb-2 font-extrabold">თემების მიხედვით</p>
          <ul className="space-y-2">
            {CATEGORIES.map((c) => {
              const ws = wordsForCategory(c.slug);
              const l = ws.filter((w) => statusOf(p, w.id) === "learned").length;
              const q = p.quizzes[c.slug];
              return (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-violet-100">
                    <span className="text-3xl">{c.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="font-ka truncate text-sm font-extrabold">{c.ka}</span>
                        <span className="shrink-0 text-xs font-bold text-slate-500">
                          {l}/{ws.length}
                          {q ? ` · 🧩 ${q.best}/${q.total}` : ""}
                        </span>
                      </div>
                      <ProgressBar value={l} max={ws.length} color={c.bar} className="mt-1.5" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-4 text-center ring-1 ring-rose-100">
          <p className="font-ka text-xs text-slate-500">პროგრესი ინახება ამ მოწყობილობის ბრაუზერში (LocalStorage).</p>
          {confirm ? (
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={() => {
                  progressActions.reset();
                  setConfirm(false);
                }}
                className="font-ka rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white"
              >
                დიახ, წაშალე
              </button>
              <button onClick={() => setConfirm(false)} className="font-ka rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold">
                გაუქმება
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirm(true)} className="font-ka mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600">
              🗑️ პროგრესის განულება
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

function Box({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-violet-100">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="font-ka text-[0.7rem] font-bold text-slate-500">{label}</div>
    </div>
  );
}
