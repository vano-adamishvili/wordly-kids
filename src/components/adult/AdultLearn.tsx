"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Flag, Layers, Puzzle } from "lucide-react";
import { categoryBySlug, highlight, setLabel } from "@/lib/adult/malta";
import { adultActions, statusOfItem, useAdultProgress } from "@/lib/adult/progress";
import { useSetItems } from "@/lib/adult/useSet";
import Wivi from "../Wivi";
import { AdultTopBar, Bar, CatIcon, LevelBadge, SayButton, SpeedToggle } from "./ui";

export default function AdultLearn({ set }: { set: string }) {
  const { items, level } = useSetItems(set);
  const [p] = useAdultProgress();
  const [i, setI] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const q = level ? `?lvl=${level}` : "";

  // start at ?i=, otherwise at the first item that isn't known yet
  useEffect(() => {
    if (!items || i !== null) return;
    const qi = Number(new URLSearchParams(window.location.search).get("i"));
    const first = items.findIndex((it) => statusOfItem(p, it.id) !== "known");
    const start = Number.isInteger(qi) && qi > 0 && qi < items.length ? qi : Math.max(0, first);
    const id = requestAnimationFrame(() => setI(start));
    return () => cancelAnimationFrame(id);
  }, [items, i, p]);

  const item = items && i !== null ? items[i] : undefined;
  useEffect(() => {
    if (item) adultActions.seen(item.id, set === "review" ? undefined : set);
  }, [item, set]);

  const go = (d: number) => {
    if (!items || i === null) return;
    const n = i + d;
    if (n >= items.length) setDone(true);
    else if (n >= 0) setI(n);
  };

  const top = <AdultTopBar back={set === "review" ? "/adults" : `/adults/set/${set}`} title={setLabel(set)} sub="სწავლა" right={<SpeedToggle />} />;
  if (!items || i === null) return <main>{top}</main>;
  if (items.length === 0)
    return (
      <main>
        {top}
        <Empty />
      </main>
    );

  if (done) {
    const known = items.filter((it) => statusOfItem(p, it.id) === "known").length;
    return (
      <main>
        {top}
        <div className="card mx-4 mt-4 flex flex-col items-center rounded-2xl p-6 text-center lg:mx-auto lg:max-w-xl">
          <Wivi mood="cheering" size={84} animate={false} />
          <p className="font-ka mt-2 text-lg font-extrabold">სეტი გავლილია</p>
          <p className="font-ka text-sm text-ink-soft">
            ნასწავლი: {known}/{items.length}. გადაამოწმე ბარათებით ან ქვიზით.
          </p>
          <div className="mt-5 grid w-full grid-cols-2 gap-2">
            <Link href={`/adults/cards/${set}${q}`} className="focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lavender font-extrabold text-white">
              <Layers size={18} /> ბარათები
            </Link>
            <Link href={`/adults/quiz/${set}${q}`} className="focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lavender-soft font-extrabold text-lavender-deep">
              <Puzzle size={18} /> ქვიზი
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const it = item!;
  const st = statusOfItem(p, it.id);
  const cat = categoryBySlug(it.cat)!;
  return (
    <main className="lg:mx-auto lg:max-w-xl">
      {top}
      <div className="px-4 pt-3">
        <div className="mb-3 flex items-center gap-3">
          <Bar value={i + 1} max={items.length} />
          <span className="shrink-0 text-xs font-extrabold text-ink-soft">
            {i + 1}/{items.length}
          </span>
        </div>

        <article key={it.id} className="animate-rise card overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-ink/5 px-4 py-2.5 text-ink-soft">
            <CatIcon slug={it.cat} size={16} />
            <span className="font-ka flex-1 truncate text-xs font-bold">{cat.ka}</span>
            {it.essential ? <span className="rounded-md bg-sun-soft px-1.5 py-0.5 text-[0.7rem] font-extrabold text-[#8A6400]">Start here</span> : null}
            <LevelBadge level={it.level} />
          </div>
          <div className="px-4 pb-4 pt-5">
            <h2 className="break-words text-[2rem] font-extrabold leading-tight tracking-tight">{it.en}</h2>
            <p className="font-ka mt-1.5 text-lg font-bold text-lavender-deep">{it.ka}</p>
            <div className="mt-3">
              <SayButton text={it.en} file={it.wordAudio} label={it.type === "phrase" ? "ფრაზა" : "სიტყვა"} />
            </div>

            <div className="mt-5 rounded-xl bg-sky-soft p-3.5">
              <p className="text-[1.05rem] font-semibold leading-snug">
                {highlight(it.sentenceEn, it.en).map((part, k) =>
                  part.hit ? (
                    <mark key={k} className="rounded bg-sun px-0.5 text-ink">
                      {part.text}
                    </mark>
                  ) : (
                    <span key={k}>{part.text}</span>
                  ),
                )}
              </p>
              <p className="font-ka mt-1.5 text-sm text-ink-soft">{it.sentenceKa}</p>
              <div className="mt-2.5">
                <SayButton text={it.sentenceEn} file={it.sentenceAudio} label="წინადადება" variant="soft" size="sm" />
              </div>
            </div>
          </div>
        </article>

        <div className="mt-4 grid grid-cols-[auto_1fr_1fr_auto] gap-2">
          <button onClick={() => go(-1)} disabled={i === 0} aria-label="წინა" className="focus-ring flex h-13 w-12 items-center justify-center rounded-xl bg-white shadow-[var(--shadow-soft)] disabled:opacity-35">
            <ArrowLeft size={22} />
          </button>
          <button
            onClick={() => {
              adultActions.rate(it.id, false);
              go(1);
            }}
            className={`focus-ring font-ka flex h-13 items-center justify-center gap-1.5 rounded-xl text-sm font-extrabold ${p.items[it.id]?.difficult ? "bg-coral text-white" : "bg-coral-soft text-coral-deep"}`}
          >
            <Flag size={18} /> რთულია
          </button>
          <button
            onClick={() => {
              adultActions.rate(it.id, true);
              go(1);
            }}
            className={`focus-ring font-ka flex h-13 items-center justify-center gap-1.5 rounded-xl text-sm font-extrabold ${st === "known" ? "bg-mint-soft text-mint-deep" : "bg-mint text-ink"}`}
          >
            <Check size={20} strokeWidth={3} /> ვიცი
          </button>
          <button onClick={() => go(1)} aria-label="შემდეგი" className="focus-ring flex h-13 w-12 items-center justify-center rounded-xl bg-white shadow-[var(--shadow-soft)]">
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </main>
  );
}

export function Empty() {
  return (
    <div className="card mx-4 mt-4 flex flex-col items-center rounded-2xl p-6 text-center">
      <Wivi mood="thinking" size={72} animate={false} />
      <p className="font-ka mt-2 font-bold">აქ ჯერ არაფერია</p>
      <p className="font-ka mt-1 text-sm text-ink-soft">გამეორებაში ხვდება „რთულად“ მონიშნული, შეცდომით ნაპასუხები და 3+ დღის წინ ნასწავლი სიტყვები.</p>
      <Link href="/adults/learn/essentials" className="focus-ring font-ka mt-4 inline-flex min-h-12 items-center rounded-xl bg-lavender px-5 font-extrabold text-white">
        დაიწყე Travel Essentials 30-ით
      </Link>
    </div>
  );
}
