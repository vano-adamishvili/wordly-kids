"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, RotateCcw, Snail, Volume2, X } from "lucide-react";
import { MALTA_ITEMS, setLabel, type MaltaItem } from "@/lib/adult/malta";
import { adultActions, useAdultProgress } from "@/lib/adult/progress";
import { useSetItems } from "@/lib/adult/useSet";
import { shuffle } from "@/lib/words";
import Wivi from "../Wivi";
import { Empty } from "./AdultLearn";
import { AdultTopBar, Bar, SayButton, SpeedToggle, useSay } from "./ui";

type QType = "en-ka" | "ka-en" | "listen-word" | "listen-sentence";
type Q = { type: QType; item: MaltaItem; options: MaltaItem[] };
const PROMPT: Record<QType, string> = {
  "en-ka": "რას ნიშნავს ქართულად?",
  "ka-en": "როგორ არის ინგლისურად?",
  "listen-word": "მოუსმინე — რას ნიშნავს?",
  "listen-sentence": "მოუსმინე წინადადებას — რომელია სწორი თარგმანი?",
};

function build(pool: MaltaItem[], mode: "mixed" | "listen", count = 10): Q[] {
  const types: QType[] = mode === "listen" ? ["listen-word", "listen-sentence"] : ["en-ka", "ka-en", "listen-word", "listen-sentence"];
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((item, i) => {
      const type = types[(i + Math.floor(Math.random() * types.length)) % types.length];
      const sameCat = MALTA_ITEMS.filter((x) => x.cat === item.cat);
      const sameLevel = MALTA_ITEMS.filter((x) => x.level === item.level);
      const picked: MaltaItem[] = [];
      for (const c of [...shuffle(sameCat), ...shuffle(sameLevel)]) {
        if (picked.length === 3) break;
        if (c.id === item.id || c.ka === item.ka || c.en === item.en) continue;
        if (picked.some((p) => p.id === c.id || p.ka === c.ka || p.en === c.en)) continue;
        picked.push(c);
      }
      return { type, item, options: shuffle([item, ...picked]) };
    });
}

export default function AdultQuiz({ set, mode }: { set: string; mode: "mixed" | "listen" }) {
  const { items, level } = useSetItems(set);
  const [, hydrated] = useAdultProgress();
  const [qs, setQs] = useState<Q[] | null>(null);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<MaltaItem[]>([]);
  const say = useSay();

  const start = () => {
    if (!items) return;
    setQs(build(items, mode));
    setQi(0);
    setPicked(null);
    setScore(0);
    setWrong([]);
  };
  useEffect(() => {
    if (items && qs === null && hydrated) {
      const id = requestAnimationFrame(start);
      return () => cancelAnimationFrame(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, hydrated]);

  const q = qs?.[qi];
  const listening = q?.type === "listen-word" || q?.type === "listen-sentence";
  const audioText = q ? (q.type === "listen-sentence" ? q.item.sentenceEn : q.item.en) : "";
  const audioFile = q ? (q.type === "listen-sentence" ? q.item.sentenceAudio : q.item.wordAudio) : undefined;
  useEffect(() => {
    if (!q) return;
    if (q.type === "en-ka" || listening) {
      const t = setTimeout(() => say(audioText, { file: audioFile }), 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const key = `${mode}:${set}${level ? `:${level}` : ""}`;
  const top = (
    <AdultTopBar
      back={set === "review" ? "/adults" : `/adults/set/${set}`}
      title={setLabel(set)}
      sub={mode === "listen" ? "მოსმენა" : "ქვიზი"}
      right={<SpeedToggle />}
    />
  );
  if (!qs) return <main>{top}</main>;
  if (qs.length === 0)
    return (
      <main>
        {top}
        <Empty />
      </main>
    );

  if (qi >= qs.length) {
    const total = qs.length;
    return (
      <main className="lg:mx-auto lg:max-w-xl">
        {top}
        <div className="card mx-4 mt-4 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Wivi mood={score / total >= 0.7 ? "cheering" : "encouraging"} size={64} animate={false} />
            <div>
              <p className="text-3xl font-extrabold">
                {score}
                <span className="text-lg text-ink-soft">/{total}</span>
              </p>
              <p className="font-ka text-sm text-ink-soft">{score === total ? "უნაკლოდ!" : score / total >= 0.7 ? "ძალიან კარგია" : "შეცდომები გამეორებაში დაემატა"}</p>
            </div>
          </div>
          {wrong.length ? (
            <ul className="mt-4 divide-y divide-ink/5 rounded-xl bg-coral-soft/50">
              {wrong.map((w) => (
                <li key={w.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{w.en}</span>
                    <span className="font-ka block truncate text-xs text-ink-soft">{w.ka}</span>
                  </span>
                  <SayButton text={w.en} file={w.wordAudio} variant="soft" size="sm" />
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={start} className="focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lavender font-extrabold text-white">
              <RotateCcw size={18} /> თავიდან
            </button>
            <Link href="/adults/cards/review" className="focus-ring font-ka flex min-h-12 items-center justify-center rounded-xl bg-lavender-soft font-extrabold text-lavender-deep">
              გამეორება
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const cur = q!;
  const answered = picked !== null;
  const correct = picked === cur.item.id;
  function choose(o: MaltaItem) {
    if (answered) return;
    setPicked(o.id);
    const ok = o.id === cur.item.id;
    adultActions.answer(cur.item.id, ok);
    if (ok) setScore((s) => s + 1);
    else setWrong((w) => [...w, cur.item]);
    if (!listening) say(cur.item.en, { file: cur.item.wordAudio });
  }
  function next() {
    const n = qi + 1;
    if (n >= qs!.length) adultActions.finishQuiz(key, score, qs!.length);
    setQi(n);
    setPicked(null);
  }
  const label = (o: MaltaItem) =>
    cur.type === "ka-en" ? o.en : cur.type === "listen-sentence" ? o.sentenceKa : o.ka;

  return (
    <main className="lg:mx-auto lg:max-w-xl">
      {top}
      <div className="px-4 pt-3">
        <div className="mb-3 flex items-center gap-3">
          <Bar value={qi + (answered ? 1 : 0)} max={qs.length} />
          <span className="shrink-0 text-xs font-extrabold text-ink-soft">
            {qi + 1}/{qs.length} · {score}
          </span>
        </div>
        <section key={qi} className="animate-rise card rounded-2xl p-5 text-center">
          <p className="font-ka text-sm font-bold text-ink-soft">{PROMPT[cur.type]}</p>
          <div className="mt-3 flex min-h-24 flex-col items-center justify-center gap-3">
            {cur.type === "en-ka" ? <p className="break-words text-[1.9rem] font-extrabold leading-tight">{cur.item.en}</p> : null}
            {cur.type === "ka-en" ? <p className="font-ka text-[1.5rem] font-extrabold leading-snug text-lavender-deep">{cur.item.ka}</p> : null}
            {listening || cur.type === "en-ka" ? (
              <div className="flex gap-2">
                <button onClick={() => say(audioText, { file: audioFile, slow: false })} className="focus-ring flex h-14 items-center gap-2 rounded-xl bg-lavender px-5 font-extrabold text-white" aria-label="მოუსმინე">
                  <Volume2 size={24} /> <span className="font-ka text-sm">მოსმენა</span>
                </button>
                <button onClick={() => say(audioText, { slow: true })} className="focus-ring flex h-14 items-center gap-2 rounded-xl bg-lavender-soft px-4 font-extrabold text-lavender-deep" aria-label="ნელა">
                  <Snail size={20} /> <span className="font-ka text-sm">ნელა</span>
                </button>
              </div>
            ) : null}
            {answered && listening ? <p className="text-base font-bold">{audioText}</p> : null}
          </div>
        </section>
        <div className="mt-3 grid gap-2">
          {cur.options.map((o) => {
            const st = !answered ? "idle" : o.id === cur.item.id ? "right" : o.id === picked ? "wrong" : "dim";
            return (
              <button
                key={o.id}
                onClick={() => choose(o)}
                disabled={answered}
                className={`focus-ring flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition ${
                  st === "right"
                    ? "border-mint bg-mint-soft"
                    : st === "wrong"
                      ? "animate-wiggle border-coral bg-coral-soft"
                      : st === "dim"
                        ? "border-transparent bg-white opacity-50"
                        : "border-transparent bg-white shadow-[var(--shadow-soft)] hover:border-lavender/40"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {st === "right" ? <Check size={20} className="text-mint-deep" strokeWidth={3} /> : st === "wrong" ? <X size={20} className="text-coral-deep" strokeWidth={3} /> : <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />}
                </span>
                <span className={`${cur.type === "ka-en" ? "font-bold" : "font-ka"} text-[0.95rem] leading-snug`}>{label(o)}</span>
              </button>
            );
          })}
        </div>
        {answered ? (
          <div className="animate-rise mt-3 flex items-center gap-3 rounded-xl bg-white p-3 shadow-[var(--shadow-soft)]">
            <div className="min-w-0 flex-1">
              <p className={`font-ka text-sm font-extrabold ${correct ? "text-mint-deep" : "text-coral-deep"}`}>{correct ? "სწორია" : "შეცდომა შენახულია გამეორებისთვის"}</p>
              <p className="truncate text-sm">
                <b>{cur.item.en}</b> — <span className="font-ka">{cur.item.ka}</span>
              </p>
            </div>
            <button onClick={next} className="focus-ring font-ka flex h-12 shrink-0 items-center gap-1 rounded-xl bg-lavender px-4 font-extrabold text-white">
              {qi + 1 >= qs.length ? "შედეგი" : "შემდეგი"} <ArrowRight size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
