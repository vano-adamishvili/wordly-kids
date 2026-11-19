"use client";

import Link from "next/link";
import { BookOpen, Flame, Layers, Puzzle, Star, ChevronRight } from "lucide-react";
import { CATEGORIES, categoryBySlug, categoryVars } from "@/data/categories";
import { DAILY_GOAL, streak, todayCount, useProgress, statusOf } from "@/lib/progress";
import { WORDS, wordsForCategory } from "@/lib/words";
import CategoryGrid, { CategoryArt } from "./CategoryGrid";
import LevelSwitcher from "./LevelSwitcher";
import { DailyFiveCard, ImportHint, Level2Intro, PracticeTools } from "./HomeExtras";
import Wivi from "./Wivi";
import WiviloLogo from "./brand/WiviloLogo";
import WordArt from "./WordArt";
import { Bubble, ProgressBar, Ring } from "./ui";

export default function HomeDashboard() {
  const [p, hydrated] = useProgress();
  const learned = WORDS.filter((w) => statusOf(p, w.id) === "learned").length;
  const days = streak(p);
  const today = todayCount(p);
  const goalDone = today >= DAILY_GOAL;

  // Next category to continue: last opened (if unfinished) or first unfinished
  const level = (hydrated ? p.level : undefined) ?? 1;
  const levelCats = CATEGORIES.filter((c) => c.level === level);
  const unfinished = (slug: string) => wordsForCategory(slug).some((w) => statusOf(p, w.id) !== "learned");
  const last = p.lastCategory ? categoryBySlug(p.lastCategory) : undefined;
  const next =
    (last && last.level === level && unfinished(last.slug) ? last : undefined) ??
    levelCats.find((c) => unfinished(c.slug)) ??
    levelCats[0];
  const nextWords = wordsForCategory(next.slug);
  const nextLearned = nextWords.filter((w) => statusOf(p, w.id) === "learned").length;
  const nextWord = nextWords.find((w) => statusOf(p, w.id) !== "learned") ?? nextWords[0];
  const nextIndex = Math.max(0, nextWords.indexOf(nextWord));

  const message = !hydrated || (learned === 0 && today === 0)
    ? "გამარჯობა! მე ვივი ვარ. ერთად ვისწავლოთ ინგლისური!"
    : goalDone
      ? "დღის მიზანი შესრულდა! შენ ნამდვილი ვარსკვლავი ხარ!"
      : today > 0
        ? `კარგად მიდიხარ! დღეს კიდევ ${DAILY_GOAL - today} სიტყვა დაგვრჩა.`
        : "დაბრუნდი! გავაგრძელოთ იქიდან, სადაც გავჩერდით?";

  return (
    <main className="px-4 pt-[max(env(safe-area-inset-top),1rem)]">
      {/* Top bar: brand + compact stats */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="m-0">
          <WiviloLogo height={30} />
        </h1>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <Chip icon={<Star size={18} className="fill-sun text-[#E5B400]" />} value={hydrated ? p.stars : 0} label="ვარსკვლავი" />
          <Chip icon={<Flame size={18} className="fill-coral text-coral-deep" />} value={hydrated ? days : 0} label="დღე ზედიზედ" />
        </div>
      </div>

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-[2rem] bg-lavender-soft p-5 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8 lg:p-8">
        <svg className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 text-lavender/15" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="50" fill="currentColor" />
        </svg>
        <svg className="pointer-events-none absolute -bottom-16 left-24 h-40 w-40 text-mint/25" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="50" fill="currentColor" />
        </svg>

        <div className="relative flex items-end gap-2">
          <Wivi mood={goalDone ? "excited" : "happy"} size={118} className="-mb-1 shrink-0" />
          <Bubble className="mb-8 flex-1">
            <p className="font-ka text-[0.95rem] font-bold leading-snug text-ink" suppressHydrationWarning>
              {message}
            </p>
          </Bubble>
        </div>

        <div className="relative mt-4 lg:mt-0 lg:w-80">
          <Link
            href={`/category/${next.slug}/learn${nextIndex ? `?i=${nextIndex}` : ""}`}
            className="press focus-ring flex min-h-16 w-full items-center justify-between gap-3 rounded-[1.4rem] bg-lavender px-5 py-3 text-white [--edge:#6a4fd0]"
          >
            <span>
              <span className="font-ka block text-lg font-extrabold leading-tight">გავაგრძელოთ სწავლა</span>
              <span className="font-ka block text-xs font-semibold text-white/85" suppressHydrationWarning>
                {next.ka} · {nextWord?.en}
              </span>
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <ChevronRight size={26} strokeWidth={3} />
            </span>
          </Link>

          {/* Daily goal */}
          <div className="mt-3 flex items-center gap-3 rounded-[1.4rem] bg-white p-3" suppressHydrationWarning>
            <Ring value={hydrated ? today : 0} max={DAILY_GOAL} size={58} stroke={8} color={goalDone ? "var(--color-mint)" : "var(--color-sun)"}>
              <span className="font-display text-base font-semibold">
                {hydrated ? Math.min(today, DAILY_GOAL) : 0}/{DAILY_GOAL}
              </span>
            </Ring>
            <div className="min-w-0 flex-1">
              <p className="font-ka text-sm font-extrabold">დღის მიზანი</p>
              <p className="font-ka text-xs text-ink-soft">
                {goalDone ? "შესრულებულია — ყოჩაღ!" : `ივარჯიშე ${DAILY_GOAL} სიტყვაზე დღეს`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-semibold leading-none" suppressHydrationWarning>
                {hydrated ? learned : 0}
                <span className="text-sm text-ink-soft">/{WORDS.length}</span>
              </p>
              <p className="font-ka text-[0.7rem] text-ink-soft">ნასწავლი</p>
            </div>
          </div>
        </div>
      </section>

      {hydrated && Object.keys(p.words).length === 0 && p.stars === 0 ? <ImportHint /> : null}

      {hydrated && !p.seenLevel2Intro ? <Level2Intro /> : null}

      <DailyFiveCard />

      <PracticeTools />

      {/* Current world + modes */}
      <section className="mt-6" style={categoryVars(next)}>
        <h2 className="font-ka mb-3 text-lg font-extrabold">ახლანდელი თემა · დონე {level}</h2>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 bg-[var(--soft)] p-4">
            <CategoryArt c={next} />
            <div className="min-w-0 flex-1" suppressHydrationWarning>
              <p className="font-ka truncate text-lg font-extrabold">{next.ka}</p>
              <p className="font-display text-sm text-[var(--deep)]">{next.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar value={nextLearned} max={nextWords.length} color="var(--accent)" track="rgb(255 255 255 / 0.9)" height={10} />
                <span className="shrink-0 text-xs font-extrabold text-[var(--deep)]">
                  {nextLearned}/{nextWords.length}
                </span>
              </div>
            </div>
            {nextWord ? (
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white sm:flex">
                <WordArt word={nextWord} size="sm" />
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            <ModeTile href={`/category/${next.slug}/learn`} Icon={BookOpen} label="სწავლა" tone="lavender" />
            <ModeTile href={`/category/${next.slug}/flashcards`} Icon={Layers} label="ბარათები" tone="mint" />
            <ModeTile href={`/category/${next.slug}/quiz`} Icon={Puzzle} label="ქვიზი" tone="coral" />
          </div>
        </div>
      </section>

      {/* All worlds */}
      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-ka text-lg font-extrabold">სასწავლო სამყაროები</h2>
          <Link href="/quiz" className="font-ka focus-ring rounded-lg text-sm font-bold text-lavender-deep">
            შერეული ქვიზი →
          </Link>
        </div>
        <div className="mb-4">
          <LevelSwitcher />
        </div>
        <CategoryGrid level={level} />
      </section>

      <footer className="mt-10 flex flex-col items-center gap-1 pb-4 text-center">
        <WiviloLogo height={22} />
        <p className="font-ka text-xs font-bold text-ink-soft">ისწავლე. ითამაშე. განვითარდი.</p>
        <p className="font-display text-xs text-ink-soft">Learn. Play. Grow.</p>
      </footer>
    </main>
  );
}

function Chip({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex h-10 items-center gap-1.5 rounded-full bg-white px-3 shadow-[var(--shadow-soft)]" aria-label={`${label}: ${value}`}>
      {icon}
      <span className="font-display text-base font-semibold">{value}</span>
    </div>
  );
}

const TONES = {
  lavender: "bg-lavender-soft text-lavender-deep [--edge:#d9cffa]",
  mint: "bg-mint-soft text-mint-deep [--edge:#bfeedd]",
  coral: "bg-coral-soft text-coral-deep [--edge:#ffd3cf]",
};

export function ModeTile({
  href,
  Icon,
  label,
  tone,
}: {
  href: string;
  Icon: typeof BookOpen;
  label: string;
  tone: keyof typeof TONES;
}) {
  return (
    <Link href={href} className={`press focus-ring flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl ${TONES[tone]}`}>
      <Icon size={26} strokeWidth={2.4} aria-hidden />
      <span className="font-ka text-sm font-extrabold">{label}</span>
    </Link>
  );
}
