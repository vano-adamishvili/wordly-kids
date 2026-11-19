"use client";

import Link from "next/link";
import { useState } from "react";
import { Flame, Star, BookCheck, Trash2 } from "lucide-react";
import { CATEGORIES, LEVELS, categoryVars, type Level } from "@/data/categories";
import { DAILY_GOAL, lastDays, longestStreak, needsReview, progressActions, statusOf, streak, useProgress } from "@/lib/progress";
import BackupPanel from "./BackupPanel";
import { WORDS, wordsForCategory, wordsForLevel } from "@/lib/words";
import { CategoryArt } from "./CategoryGrid";
import Wivi from "./Wivi";
import WordArt from "./WordArt";
import { Art, Bubble, ProgressBar, Ring, TopBar } from "./ui";

const WEEKDAYS = ["კვ", "ორ", "სა", "ოთ", "ხუ", "პა", "შა"];

export default function ProgressView() {
  const [p, hydrated] = useProgress();
  const [confirm, setConfirm] = useState(false);
  const [tab, setTab] = useState<Level>(1);

  const counts = { new: 0, learning: 0, learned: 0 };
  WORDS.forEach((w) => counts[statusOf(p, w.id)]++);
  const review = WORDS.filter((w) => needsReview(p, w.id)).sort(
    (a, b) => (p.words[b.id]?.wrong ?? 0) - (p.words[a.id]?.wrong ?? 0),
  );
  const quizzes = Object.values(p.quizzes);
  const catDone = CATEGORIES.filter((c) => wordsForCategory(c.slug).every((w) => statusOf(p, w.id) === "learned")).length;
  const days = streak(p);
  const best = longestStreak(p);
  const week = hydrated ? lastDays(p, 7) : [];
  const weekMax = Math.max(DAILY_GOAL, ...week.map((d) => d.count));

  // Badges – every condition is computed from stored progress
  const badges = [
    { art: "seedling", ka: "პირველი სიტყვა", got: counts.learned >= 1, hint: "ისწავლე 1 სიტყვა" },
    { art: "hatching-chick", ka: "10 სიტყვა", got: counts.learned >= 10, hint: `${Math.min(counts.learned, 10)}/10` },
    { art: "bullseye", ka: "პირველი ქვიზი", got: quizzes.some((q) => q.plays > 0), hint: "გაიარე ქვიზი" },
    { art: "1st-place-medal", ka: "უნაკლო ქვიზი", got: quizzes.some((q) => q.best === q.total && q.total > 0), hint: "ყველა სწორი პასუხი" },
    { art: "fire", ka: "3 დღე ზედიზედ", got: best >= 3, hint: `${Math.min(best, 3)}/3 დღე` },
    { art: "trophy", ka: "პირველი სამყარო", got: catDone >= 1, hint: "დაასრულე 1 თემა" },
    { art: "rocket", ka: "30 სიტყვა", got: counts.learned >= 30, hint: `${Math.min(counts.learned, 30)}/30` },
    { art: "glowing-star", ka: "60 სიტყვა", got: counts.learned >= 60, hint: `${Math.min(counts.learned, 60)}/60` },
    { art: "crown", ka: "120 სიტყვა", got: counts.learned >= 120, hint: `${Math.min(counts.learned, 120)}/120` },
    { art: "ringed-planet", ka: "დონე 2 დაიწყო", got: WORDS.some((w) => w.level === 2 && statusOf(p, w.id) === "learned"), hint: "ისწავლე 1 სიტყვა დონე 2-ში" },
    { art: "whale", ka: "საპირისპიროების ოსტატი", got: (p.quizzes.opposites?.best ?? 0) === 5, hint: "5/5 პირველივე ცდაზე" },
    { art: "sports-medal", ka: "ყველა 240", got: counts.learned >= 240, hint: `${counts.learned}/240` },
  ];
  const earned = badges.filter((b) => b.got).length;

  const message =
    counts.learned === 0
      ? "დავიწყოთ! პირველივე სიტყვა პირველ ჯილდოს მოგიტანს."
      : counts.learned >= 240
        ? "ყველა 240 სიტყვა ისწავლე! წარმოუდგენელია!"
        : review.length > 0
          ? `უკვე ${counts.learned} სიტყვა იცი! ${review.length} სიტყვა გასამეორებელია.`
          : `უკვე ${counts.learned} სიტყვა იცი! ასე განაგრძე!`;

  if (!hydrated) {
    return (
      <main>
        <TopBar back="/" title="ჩემი პროგრესი" />
      </main>
    );
  }

  return (
    <main>
      <TopBar back="/" title="ჩემი პროგრესი" />
      <div className="space-y-5 px-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
        {/* Wivi + message */}
        <section className="relative overflow-hidden rounded-[2rem] bg-lavender-soft p-5 lg:col-span-2">
          <div className="flex items-end gap-2">
            <Wivi mood={counts.learned > 0 ? "excited" : "encouraging"} size={104} className="-mb-1 shrink-0" />
            <Bubble className="mb-6 flex-1">
              <p className="font-ka text-[0.95rem] font-bold leading-snug">{message}</p>
            </Bubble>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat icon={<Star size={22} className="fill-sun text-[#E5B400]" />} value={p.stars} label="ვარსკვლავი" />
            <Stat icon={<BookCheck size={22} className="text-mint-deep" />} value={counts.learned} label="ნასწავლი სიტყვა" />
            <Stat icon={<Flame size={22} className="fill-coral text-coral-deep" />} value={days} label="დღე ზედიზედ" />
          </div>
        </section>

        {/* 120 words overview */}
        <section className="card p-5">
          <p className="font-ka mb-3 font-extrabold">{WORDS.length} სიტყვიდან</p>
          <div className="flex h-5 overflow-hidden rounded-full bg-ink/6">
            <div className="bg-mint transition-all" style={{ width: `${(counts.learned / WORDS.length) * 100}%` }} />
            <div className="bg-sun transition-all" style={{ width: `${(counts.learning / WORDS.length) * 100}%` }} />
          </div>
          <div className="font-ka mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-ink-soft">
            <Legend color="bg-mint" label="ნასწავლი" value={counts.learned} />
            <Legend color="bg-sun" label="ვსწავლობ" value={counts.learning} />
            <Legend color="bg-ink/10" label="ახალი" value={counts.new} />
          </div>
        </section>

        {/* Week */}
        <section className="card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-ka font-extrabold">ეს კვირა</p>
            <p className="font-ka text-xs font-bold text-ink-soft">რეკორდი: {best} დღე ზედიზედ</p>
          </div>
          <div className="flex h-36 justify-between gap-2">
            {week.map((d, i) => {
              const h = d.count ? Math.max(14, (d.count / weekMax) * 100) : 6;
              const isToday = i === week.length - 1;
              const goal = d.count >= DAILY_GOAL;
              return (
                <div key={d.key} className="flex h-full flex-1 flex-col items-center gap-1.5">
                  <span className="font-display h-4 text-xs font-semibold text-ink-soft">{d.count || ""}</span>
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className={`w-full max-w-9 rounded-xl ${goal ? "bg-mint" : d.count ? "bg-sun" : "bg-ink/8"}`}
                      style={{ height: `${h}%` }}
                      title={`${d.count} სიტყვა`}
                    />
                  </div>
                  <span className={`font-ka text-[0.7rem] font-bold ${isToday ? "text-lavender-deep" : "text-ink-soft"}`}>
                    {isToday ? "დღეს" : WEEKDAYS[d.date.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="font-ka mt-2 text-xs text-ink-soft">მწვანე სვეტი = დღის მიზანი ({DAILY_GOAL} სიტყვა) შესრულებულია</p>
        </section>

        {/* Badges */}
        <section className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-ka font-extrabold">ჯილდოები</p>
            <p className="font-display text-sm font-semibold text-ink-soft">
              {earned}/{badges.length}
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {badges.map((b) => (
              <li key={b.art} className="flex flex-col items-center text-center">
                <div
                  className={`relative flex h-18 w-18 items-center justify-center rounded-full ${
                    b.got ? "bg-sun-soft ring-4 ring-sun" : "bg-ink/5 ring-2 ring-dashed ring-ink/10"
                  }`}
                >
                  <Art name={b.art} className={`h-11 w-11 ${b.got ? "" : "opacity-30 grayscale"}`} />
                </div>
                <p className={`font-ka mt-2 text-xs font-extrabold leading-tight ${b.got ? "text-ink" : "text-ink-soft"}`}>{b.ka}</p>
                {!b.got ? <p className="font-ka text-[0.65rem] text-ink-soft">{b.hint}</p> : null}
              </li>
            ))}
          </ul>
        </section>

        {/* Words to review */}
        <section className="card p-5">
          <p className="font-ka mb-3 font-extrabold">გასამეორებელი სიტყვები</p>
          {review.length === 0 ? (
            <p className="font-ka text-sm text-ink-soft">
              {counts.learned ? "ყველა ნანახი სიტყვა უკვე ნასწავლია!" : "ჯერ სიტყვები არ გინახავს — დაიწყე სწავლა."}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {review.slice(0, 12).map((w) => {
                const c = CATEGORIES.find((x) => x.name === w.category)!;
                const idx = wordsForCategory(c.slug).findIndex((x) => x.id === w.id);
                return (
                  <li key={w.id}>
                    <Link
                      href={`/category/${c.slug}/learn?i=${idx}`}
                      style={categoryVars(c)}
                      className="press focus-ring flex items-center gap-2 rounded-2xl bg-[var(--soft)] py-1.5 pl-1.5 pr-3 [--edge:color-mix(in_srgb,var(--accent)_40%,transparent)]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                        <WordArt word={w} size="sm" className="!h-7 !w-7" />
                      </span>
                      <span className="font-display text-base font-semibold">{w.en}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Levels */}
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-ink/5 p-1" role="tablist" aria-label="დონე">
            {LEVELS.map(({ level, ka }) => (
              <button
                key={level}
                role="tab"
                aria-selected={tab === level}
                onClick={() => setTab(level)}
                className={`focus-ring font-ka min-h-11 rounded-xl text-sm font-extrabold transition ${tab === level ? "bg-white text-lavender-deep shadow-[var(--shadow-soft)]" : "text-ink-soft"}`}
              >
                {ka}
              </button>
            ))}
          </div>
          <LevelStats level={tab} />
        </section>

        <BackupPanel />

        {/* Reset */}
        <section className="rounded-[1.75rem] border-2 border-dashed border-ink/10 p-4 text-center lg:col-span-2">
          <p className="font-ka text-xs text-ink-soft">პროგრესი ინახება ამ მოწყობილობის ბრაუზერში.</p>
          {confirm ? (
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={() => {
                  progressActions.reset();
                  setConfirm(false);
                }}
                className="press focus-ring font-ka min-h-11 rounded-xl bg-coral px-4 text-sm font-extrabold text-white [--edge:#d9554c]"
              >
                დიახ, წაშალე
              </button>
              <button onClick={() => setConfirm(false)} className="press focus-ring font-ka min-h-11 rounded-xl bg-white px-4 text-sm font-extrabold">
                გაუქმება
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="focus-ring font-ka mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-coral-deep"
            >
              <Trash2 size={16} /> პროგრესის განულება
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

function LevelStats({ level }: { level: Level }) {
  const [p] = useProgress();
  const ws = wordsForLevel(level);
  const studied = ws.filter((w) => p.words[w.id] && (p.words[w.id].seen > 0 || p.words[w.id].status !== "new")).length;
  const mastered = ws.filter((w) => statusOf(p, w.id) === "learned").length;
  const toReview = ws.filter((w) => needsReview(p, w.id)).length;
  const pct = Math.round((mastered / ws.length) * 100);
  const cats = CATEGORIES.filter((c) => c.level === level);
  return (
    <div>
      <div className="flex items-center gap-4">
        <Ring value={mastered} max={ws.length} size={72} stroke={9} color="var(--color-mint)">
          <span className="font-display text-xl font-semibold">{pct}%</span>
        </Ring>
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 text-center">
          <MiniStat value={studied} label="ნანახი" />
          <MiniStat value={mastered} label="ნასწავლი" />
          <MiniStat value={toReview} label="გასამეო­რებელი" />
        </div>
      </div>
      <p className="font-ka mt-3 text-xs text-ink-soft">
        დონის დასრულება: {mastered}/{ws.length} სიტყვა · {cats.filter((c) => wordsForCategory(c.slug).every((w) => statusOf(p, w.id) === "learned")).length}/12 თემა
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {cats.map((c) => {
          const cw = wordsForCategory(c.slug);
          const l = cw.filter((w) => statusOf(p, w.id) === "learned").length;
          const q = p.quizzes[c.slug];
          return (
            <li key={c.slug} style={categoryVars(c)}>
              <Link href={`/category/${c.slug}`} className="focus-ring flex items-center gap-3 rounded-2xl p-1.5 hover:bg-[var(--soft)]">
                <div className="origin-left scale-[0.62]" style={{ width: 60, height: 50 }}>
                  <CategoryArt c={c} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <span className="font-ka truncate text-sm font-extrabold">{c.ka}</span>
                    <span className="font-display shrink-0 text-xs font-semibold text-ink-soft">
                      {l}/{cw.length}
                    </span>
                  </div>
                  <ProgressBar value={l} max={cw.length} color="var(--accent)" height={9} className="mt-1.5" />
                  {q ? <p className="font-ka mt-1 text-[0.7rem] font-semibold text-ink-soft">საუკეთესო ქვიზი: {q.best}/{q.total}</p> : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-cream px-1 py-2">
      <div className="font-display text-xl font-semibold leading-none">{value}</div>
      <div className="font-ka mt-1 break-words text-[0.62rem] font-bold leading-tight text-ink-soft">{label}</div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center">
      <div className="flex justify-center">{icon}</div>
      <div className="font-display mt-1 text-2xl font-semibold leading-none">{value}</div>
      <div className="font-ka mt-1 text-[0.7rem] font-bold leading-tight text-ink-soft">{label}</div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="font-display text-base font-semibold text-ink">{value}</span>
      </div>
      <span>{label}</span>
    </div>
  );
}
