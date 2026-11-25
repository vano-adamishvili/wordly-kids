"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Headphones, Layers, Puzzle } from "lucide-react";
import { setLabel, staticSetItems, categoryBySlug } from "@/lib/adult/malta";
import { isDue, reviewItems, statusOfItem, useAdultProgress } from "@/lib/adult/progress";
import { AdultTopBar, Bar, CatIcon, LevelBadge, SayButton, SpeedToggle } from "./ui";

export default function AdultSet({ set }: { set: string }) {
  const [p, hydrated] = useAdultProgress();
  const [lvl, setLvl] = useState<"all" | "B1" | "B2">("all");
  const cat = categoryBySlug(set);
  const base = set === "review" ? (hydrated ? reviewItems(p) : []) : staticSetItems(set);
  const items = lvl === "all" ? base : base.filter((i) => i.level === lvl);
  const showFilter = set !== "b1" && set !== "b2";
  const q = lvl === "all" ? "" : `?lvl=${lvl}`;
  const known = hydrated ? items.filter((i) => statusOfItem(p, i.id) === "known").length : 0;

  return (
    <main className="pb-24">
      <AdultTopBar back={cat ? "/adults/categories" : "/adults"} title={setLabel(set)} sub={cat ? cat.en : "Malta Travel English"} right={<SpeedToggle />} />
      <div className="space-y-4 px-4 pt-3 lg:mx-auto lg:max-w-3xl">
        <section className="card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {cat ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-lavender-soft text-lavender-deep">
                <CatIcon slug={set} size={24} />
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-ka text-sm font-extrabold" suppressHydrationWarning>
                ნასწავლი {known}/{items.length}
              </p>
              <Bar value={known} max={items.length} className="mt-1.5" />
            </div>
          </div>
          {showFilter ? (
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-ink/5 p-1" role="tablist" aria-label="დონე">
              {(["all", "B1", "B2"] as const).map((l) => (
                <button
                  key={l}
                  role="tab"
                  aria-selected={lvl === l}
                  onClick={() => setLvl(l)}
                  className={`focus-ring min-h-10 rounded-lg text-sm font-extrabold ${lvl === l ? "bg-white shadow-[var(--shadow-soft)]" : "text-ink-soft"}`}
                >
                  <span className="font-ka">{l === "all" ? "ყველა" : l}</span>
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-3 grid grid-cols-4 gap-2">
            <Mode href={`/adults/learn/${set}${q}`} Icon={BookOpen} label="სწავლა" primary />
            <Mode href={`/adults/cards/${set}${q}`} Icon={Layers} label="ბარათები" />
            <Mode href={`/adults/quiz/${set}${q}`} Icon={Puzzle} label="ქვიზი" />
            <Mode href={`/adults/listen/${set}${q}`} Icon={Headphones} label="მოსმენა" />
          </div>
        </section>

        <ul className="card divide-y divide-ink/5 overflow-hidden rounded-2xl">
          {items.map((it, idx) => {
            const st = hydrated ? statusOfItem(p, it.id) : "new";
            const due = hydrated && isDue(p, it.id);
            return (
              <li key={it.id} className="flex items-center gap-3 px-3 py-2.5">
                <Link href={`/adults/learn/${set}?i=${idx}${lvl === "all" ? "" : `&lvl=${lvl}`}`} className="focus-ring min-w-0 flex-1 rounded-lg">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[0.98rem] font-extrabold">{it.en}</span>
                    <LevelBadge level={it.level} />
                  </span>
                  <span className="font-ka block truncate text-xs text-ink-soft">{it.ka}</span>
                </Link>
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${st === "known" ? (due ? "bg-sun" : "bg-mint") : st === "learning" ? "bg-coral" : "bg-ink/10"}`}
                  title={st === "known" ? "ნასწავლი" : st === "learning" ? "ვსწავლობ" : "ახალი"}
                  aria-label={st === "known" ? "ნასწავლი" : st === "learning" ? "ვსწავლობ" : "ახალი"}
                  suppressHydrationWarning
                />
                <SayButton text={it.en} file={it.wordAudio} variant="soft" size="sm" />
              </li>
            );
          })}
          {hydrated && items.length === 0 ? (
            <li className="font-ka p-4 text-sm text-ink-soft">აქ ჯერ არაფერია. ჯერ ისწავლე ან გაიარე ქვიზი — შეცდომები აქ გამოჩნდება.</li>
          ) : null}
        </ul>
      </div>
    </main>
  );
}

function Mode({ href, Icon, label, primary }: { href: string; Icon: typeof BookOpen; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`focus-ring flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl ${primary ? "bg-lavender text-white" : "bg-lavender-soft text-lavender-deep"}`}
    >
      <Icon size={20} />
      <span className="font-ka text-[0.72rem] font-extrabold">{label}</span>
    </Link>
  );
}
