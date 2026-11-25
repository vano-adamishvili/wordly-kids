"use client";

import Link from "next/link";
import { ChevronRight, Headphones, MessagesSquare, Puzzle, Repeat, Sparkles } from "lucide-react";
import { MALTA_CATEGORIES, MALTA_ITEMS, setLabel, staticSetItems } from "@/lib/adult/malta";
import { isDue, statusOfItem, useAdultProgress } from "@/lib/adult/progress";
import Wivi from "../Wivi";
import { AdultTopBar, Bar, CatIcon, SpaceSwitch, SpeedToggle } from "./ui";

export default function AdultDashboard() {
  const [p, hydrated] = useAdultProgress();
  const known = (ids: { id: string }[]) => (hydrated ? ids.filter((i) => statusOfItem(p, i.id) === "known").length : 0);
  const ess = staticSetItems("essentials");
  const due = hydrated ? MALTA_ITEMS.filter((i) => isDue(p, i.id)).length : 0;
  const studied = hydrated ? MALTA_ITEMS.filter((i) => statusOfItem(p, i.id) !== "new").length : 0;
  const cont = (hydrated && p.lastSet && p.lastSet !== "review" ? p.lastSet : "essentials") as string;
  const b1 = MALTA_ITEMS.filter((i) => i.level === "B1");
  const b2 = MALTA_ITEMS.filter((i) => i.level === "B2");

  return (
    <main className="pb-24">
      <AdultTopBar right={<SpeedToggle />} />
      <div className="space-y-4 px-4 pt-3 lg:mx-auto lg:max-w-3xl">
        <div className="flex items-center justify-between gap-2">
          <SpaceSwitch active="adults" />
          <span className="font-ka text-xs font-semibold text-ink-soft">B1–B2 · 150 ერთეული</span>
        </div>

        {/* Hero */}
        <section className="rounded-2xl bg-ink p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Malta Travel English</p>
          <h1 className="font-ka mt-1 text-xl font-extrabold leading-snug">მოგზაურობის ინგლისური მალტისთვის</h1>
          <div className="mt-3 flex items-center gap-3" suppressHydrationWarning>
            <Bar value={known(MALTA_ITEMS)} max={150} color="var(--color-sun)" className="bg-white/15" />
            <span className="shrink-0 text-sm font-extrabold">{known(MALTA_ITEMS)}/150</span>
          </div>
          <p className="font-ka mt-1 text-xs text-white/70" suppressHydrationWarning>
            ნასწავლი · ნანახი {studied} · გასამეორებელი {due}
          </p>
          <Link
            href={`/adults/learn/${cont}`}
            className="focus-ring mt-4 flex min-h-14 items-center justify-between rounded-xl bg-white px-4 text-ink"
          >
            <span>
              <span className="font-ka block text-base font-extrabold">სწავლის გაგრძელება</span>
              <span className="font-ka block text-xs font-semibold text-ink-soft" suppressHydrationWarning>
                {setLabel(cont)}
              </span>
            </span>
            <ChevronRight size={22} strokeWidth={2.8} className="text-lavender-deep" />
          </Link>
        </section>

        {/* Essentials + review */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/adults/set/essentials" className="focus-ring card flex min-h-32 flex-col justify-between rounded-2xl p-4">
            <span className="flex items-center gap-2 text-lavender-deep">
              <Sparkles size={20} />
              <span className="text-xs font-extrabold uppercase tracking-wide">Start here</span>
            </span>
            <span>
              <span className="block text-base font-extrabold leading-tight">Travel Essentials 30</span>
              <span className="font-ka block text-xs text-ink-soft" suppressHydrationWarning>
                ნასწავლი {known(ess)}/30
              </span>
              <Bar value={known(ess)} max={30} className="mt-2" />
            </span>
          </Link>
          <Link href="/adults/cards/review" className="focus-ring card flex min-h-32 flex-col justify-between rounded-2xl p-4">
            <span className="flex items-center gap-2 text-coral-deep">
              <Repeat size={20} />
              <span className="font-ka text-xs font-extrabold">სწრაფი გამეორება</span>
            </span>
            <span>
              <span className="block text-3xl font-extrabold leading-none" suppressHydrationWarning>
                {due}
              </span>
              <span className="font-ka block text-xs text-ink-soft">{due ? "სიტყვა გასამეორებელია" : "ჯერ არაფერია გასამეორებელი"}</span>
            </span>
          </Link>
        </div>

        {/* Practice modes */}
        <div className="grid grid-cols-3 gap-2">
          <Tool href={`/adults/listen/${cont}`} Icon={Headphones} label="მოსმენა" />
          <Tool href={`/adults/quiz/${cont}`} Icon={Puzzle} label="ქვიზი" />
          <Tool href="/adults/talk" Icon={MessagesSquare} label="საუბარი" />
        </div>

        {/* Levels */}
        <section>
          <h2 className="font-ka mb-2 text-sm font-extrabold text-ink-soft">დონის მიხედვით</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { set: "b1", label: "მხოლოდ B1", items: b1, color: "var(--color-mint)" },
              { set: "b2", label: "მხოლოდ B2", items: b2, color: "var(--color-lavender)" },
            ].map((l) => (
              <Link key={l.set} href={`/adults/set/${l.set}`} className="focus-ring card rounded-2xl p-4">
                <span className="font-ka block text-sm font-extrabold">{l.label}</span>
                <span className="block text-xs text-ink-soft" suppressHydrationWarning>
                  {known(l.items)}/75
                </span>
                <Bar value={known(l.items)} max={75} color={l.color} className="mt-2" />
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-ka text-sm font-extrabold text-ink-soft">კატეგორიები</h2>
            <Link href="/adults/categories" className="font-ka focus-ring rounded text-sm font-bold text-lavender-deep">
              ყველა 15 →
            </Link>
          </div>
          <ul className="card divide-y divide-ink/5 overflow-hidden rounded-2xl">
            {MALTA_CATEGORIES.slice(0, 5).map((c) => (
              <CategoryRow key={c.slug} slug={c.slug} ka={c.ka} en={c.en} known={known(staticSetItems(c.slug))} />
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-2 pt-1">
          <Wivi mood="encouraging" size={40} animate={false} />
          <p className="font-ka text-xs text-ink-soft">დღეში 10 წუთიც საკმარისია. მოგზაურობის წინ დაიწყე „Start here“-ით.</p>
        </div>
        <p className="text-[0.7rem] text-ink-soft">B1/B2 ნიშნები მიახლოებითი სასწავლო დაჯგუფებაა და არა CEFR-ის სერტიფიცირებული დონე.</p>
      </div>
    </main>
  );
}

function Tool({ href, Icon, label }: { href: string; Icon: typeof Headphones; label: string }) {
  return (
    <Link href={href} className="focus-ring card flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl text-ink">
      <Icon size={22} className="text-lavender-deep" />
      <span className="font-ka text-xs font-extrabold">{label}</span>
    </Link>
  );
}

export function CategoryRow({ slug, ka, en, known }: { slug: string; ka: string; en: string; known: number }) {
  return (
    <li>
      <Link href={`/adults/set/${slug}`} className="focus-ring flex min-h-16 items-center gap-3 px-4 py-2.5 hover:bg-cream">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender-soft text-lavender-deep">
          <CatIcon slug={slug} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-ka block truncate text-sm font-extrabold">{ka}</span>
          <span className="block truncate text-xs text-ink-soft">{en}</span>
        </span>
        <span className="w-16 shrink-0 text-right">
          <span className="block text-xs font-extrabold" suppressHydrationWarning>
            {known}/10
          </span>
          <Bar value={known} max={10} className="mt-1" />
        </span>
      </Link>
    </li>
  );
}
