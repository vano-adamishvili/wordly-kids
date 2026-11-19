"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { playEnglish } from "@/lib/audio";
import { progressActions, statusOf, useProgress } from "@/lib/progress";
import { artKey, shuffle, WORDS, wordsForCategory, type Word } from "@/lib/words";
import WordArt from "./WordArt";
import { categoryBySlug, categoryVars } from "@/data/categories";
import { ArrowRight, Check, RotateCcw, Star, Volume2, X } from "lucide-react";
import Wobble from "./Wobble";
import { Bubble, Confetti, ProgressBar, SpeakButton, TopBar } from "./ui";

type QType = "pic-en" | "en-ka" | "ka-en" | "listen-pic";
type Question = { type: QType; word: Word; options: Word[] };

const PROMPTS: Record<QType, string> = {
  "pic-en": "რა არის სურათზე? აირჩიე ინგლისური სიტყვა",
  "en-ka": "რას ნიშნავს ეს სიტყვა ქართულად?",
  "ka-en": "როგორ არის ინგლისურად?",
  "listen-pic": "მოუსმინე და აირჩიე სწორი სურათი",
};

const PRAISE = ["ყოჩაღ!", "სუპერ!", "მშვენიერია!", "ზუსტად!", "შესანიშნავია!"];
const SUPPORT = ["არა უშავს!", "კარგი ცდა იყო!", "შემდეგზე გამოვა!"];

function buildQuiz(pool: Word[], count: number, distractorPool: Word[]): Question[] {
  const types: QType[] = ["pic-en", "en-ka", "ka-en", "listen-pic"];
  const targets = shuffle(pool).slice(0, Math.min(count, pool.length));
  return targets.map((word, i) => {
    const type = types[(i + Math.floor(Math.random() * 4)) % 4];
    // distractors: same category first, must look/read different
    const sameCat = distractorPool.filter((w) => w.category === word.category);
    const candidates = shuffle(sameCat.length >= 4 ? sameCat : distractorPool).filter(
      (w) =>
        w.id !== word.id &&
        w.ka !== word.ka &&
        w.en !== word.en &&
        (type !== "listen-pic" || artKey(w) !== artKey(word)),
    );
    const picked: Word[] = [];
    for (const c of candidates) {
      if (picked.length === 3) break;
      if (type === "listen-pic" && picked.some((p) => artKey(p) === artKey(c))) continue;
      if (picked.some((p) => p.ka === c.ka || p.en === c.en)) continue;
      picked.push(c);
    }
    return { type, word, options: shuffle([word, ...picked]) };
  });
}

export default function QuizGame({
  quizKey,
  slug,
  title,
  back,
  count = 10,
}: {
  quizKey: string;
  slug?: string; // category quiz if set, else mixed
  title: string;
  back: string;
  count?: number;
}) {
  const [p] = useProgress();
  const pool = useMemo(() => (slug ? wordsForCategory(slug) : WORDS), [slug]);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Word[]>([]);
  const [praise, setPraise] = useState(PRAISE[0]);
  const cat = slug ? categoryBySlug(slug) : undefined;
  const vars = cat ? categoryVars(cat) : ({ "--accent": "#8B6CE8", "--soft": "#EFEAFD", "--deep": "#6A4FD0" } as React.CSSProperties);

  function start() {
    let targets = pool;
    if (!slug) {
      // mixed quiz: prefer words the child has already met
      const met = WORDS.filter((w) => statusOf(p, w.id) !== "new");
      targets = met.length >= count ? met : WORDS;
    }
    setQuestions(buildQuiz(targets, count, pool));
    setQi(0);
    setPicked(null);
    setScore(0);
    setMistakes([]);
  }

  // Build on the client after mount (random → no hydration mismatch)
  useEffect(() => {
    if (slug) progressActions.visitCategory(slug);
    const id = requestAnimationFrame(() => start());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const q = questions?.[qi];

  // Auto-play the word for listening questions
  useEffect(() => {
    if (q?.type === "listen-pic") {
      const t = setTimeout(() => playEnglish(q.word.audioEn, q.word.en), 350);
      return () => clearTimeout(t);
    }
  }, [q]);

  if (!questions) {
    return (
      <main style={vars}>
        <TopBar back={back} title={title} sub="ქვიზი" />
        <div className="mt-16 flex flex-col items-center gap-3">
          <Wobble mood="thinking" size={110} />
          <p className="font-ka text-ink-soft">ვამზადებ კითხვებს…</p>
        </div>
      </main>
    );
  }

  const total = questions.length;

  if (qi >= total) {
    const pct = score / total;
    const stars = score === total ? 3 : pct >= 0.7 ? 2 : score > 0 ? 1 : 0;
    const headline = pct === 1 ? "უნაკლოდ!" : pct >= 0.7 ? "ძალიან კარგია!" : pct >= 0.4 ? "კარგი ცდაა!" : "ვივარჯიშოთ კიდევ!";
    const note =
      pct === 1
        ? "ყველა პასუხი სწორია. შენ ნამდვილი ჩემპიონი ხარ!"
        : pct >= 0.7
          ? "თითქმის ყველაფერი იცი. ცოტაც და სრულყოფილი იქნება!"
          : "ყოველი ცდა გაძლიერებს. გავიმეოროთ ეს სიტყვები ერთად.";
    return (
      <main style={vars} className="lg:mx-auto lg:w-full lg:max-w-xl">
        {pct >= 0.7 ? <Confetti /> : null}
        <TopBar back={back} title={title} sub="შედეგი" />
        <div className="animate-pop card mx-4 mt-2 flex flex-col items-center p-6 text-center">
          <Wobble mood={pct >= 0.7 ? "excited" : "encouraging"} size={140} />
          <p className="font-ka mt-1 text-2xl font-extrabold">{headline}</p>
          <p className="font-display mt-1 text-5xl font-semibold text-[var(--deep)]">
            {score}
            <span className="text-2xl text-ink-soft">/{total}</span>
          </p>
          <div className="mt-3 flex gap-2" aria-label={`${stars} ვარსკვლავი 3-დან`}>
            {[0, 1, 2].map((s) => (
              <Star
                key={s}
                size={44}
                strokeWidth={2}
                className={`${s < stars ? "animate-pop fill-sun text-[#E5B400]" : "fill-ink/5 text-ink/15"}`}
                style={{ animationDelay: `${0.2 + s * 0.18}s` }}
              />
            ))}
          </div>
          <p className="font-ka mt-1 text-sm font-bold text-ink-soft">+{stars} ვარსკვლავი</p>
          <p className="font-ka mt-3 text-sm text-ink-soft">{note}</p>

          {mistakes.length ? (
            <div className="mt-5 w-full text-left">
              <p className="font-ka mb-2 text-sm font-extrabold">გავიმეოროთ:</p>
              <ul className="space-y-2">
                {mistakes.map((w) => (
                  <li key={w.id} className="flex items-center gap-3 rounded-2xl bg-sun-soft p-2.5">
                    <WordArt word={w} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold leading-tight">{w.en}</p>
                      <p className="font-ka text-sm text-ink-soft">{w.ka}</p>
                    </div>
                    <SpeakButton src={w.audioEn} text={w.en} size="sm" variant="white" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 grid w-full gap-3">
            <button onClick={start} className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lavender text-lg font-extrabold text-white [--edge:#6a4fd0]">
              <RotateCcw size={22} /> კიდევ ერთხელ
            </button>
            <Link href={back} className="press focus-ring font-ka flex min-h-13 items-center justify-center rounded-2xl bg-lavender-soft font-extrabold text-lavender-deep [--edge:#d9cffa]">
              დაბრუნება
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const answered = picked !== null;
  const correct = answered && picked === q!.word.id;

  function choose(w: Word) {
    if (answered || !q) return;
    setPicked(w.id);
    const ok = w.id === q.word.id;
    progressActions.answer(q.word.id, ok);
    if (ok) {
      setScore((s) => s + 1);
      setPraise(PRAISE[(qi * 3 + score) % PRAISE.length]);
      if (q.type !== "listen-pic") playEnglish(q.word.audioEn, q.word.en);
    } else {
      setPraise(SUPPORT[qi % SUPPORT.length]);
      setMistakes((m) => (m.some((x) => x.id === q.word.id) ? m : [...m, q.word]));
    }
  }

  function next() {
    const n = qi + 1;
    if (n >= total) progressActions.finishQuiz(quizKey, score, total);
    setQi(n);
    setPicked(null);
  }

  const optState = (w: Word) => {
    if (!answered) return "idle";
    if (w.id === q!.word.id) return "right";
    if (w.id === picked) return "wrong";
    return "dim";
  };
  const optCls = (s: string) =>
    s === "right"
      ? "bg-mint text-ink border-[#3fb98c] [--edge:#3fb98c] animate-pop"
      : s === "wrong"
        ? "bg-coral-soft text-coral-deep border-coral [--edge:#ffc2bd] animate-wiggle"
        : s === "dim"
          ? "bg-white text-ink border-transparent opacity-45"
          : "bg-white text-ink border-transparent hover:border-[var(--accent)]";
  const LETTERS = ["A", "B", "C", "D"];
  const isPics = q!.type === "listen-pic";

  return (
    <main style={vars} className="lg:mx-auto lg:w-full lg:max-w-xl">
      <TopBar
        back={back}
        title={title}
        sub={`კითხვა ${qi + 1} / ${total}`}
        right={
          <span className="flex h-11 items-center gap-1.5 rounded-full bg-white px-3 shadow-[var(--shadow-soft)]" aria-label={`ქულა: ${score}`}>
            <Star size={18} className="fill-sun text-[#E5B400]" />
            <span className="font-display text-base font-semibold">{score}</span>
          </span>
        }
      />
      <div className="px-4">
        <ProgressBar value={qi + (answered ? 1 : 0)} max={total} color="var(--accent)" className="mb-4" />

        {/* Question card */}
        <section key={qi} className="animate-rise card relative overflow-hidden px-5 pb-6 pt-4 text-center">
          <div className="absolute inset-x-0 top-0 h-2 bg-[var(--accent)]" aria-hidden />
          <div className="flex items-center gap-2 text-left">
            <Wobble mood={!answered ? "thinking" : correct ? "excited" : "encouraging"} size={56} className="shrink-0" />
            <p className="font-ka flex-1 text-[0.95rem] font-bold text-ink-soft">{PROMPTS[q!.type]}</p>
          </div>
          <div className="mt-3 flex min-h-40 flex-col items-center justify-center gap-3">
            {q!.type === "pic-en" ? (
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-[var(--soft)]">
                <WordArt word={q!.word} size="lg" />
              </div>
            ) : null}
            {q!.type === "en-ka" ? (
              <>
                <p className="font-display text-5xl font-semibold">{q!.word.en}</p>
                <SpeakButton src={q!.word.audioEn} text={q!.word.en} variant="soft" />
              </>
            ) : null}
            {q!.type === "ka-en" ? <p className="font-ka rounded-2xl bg-sun px-6 py-2.5 text-4xl font-extrabold">{q!.word.ka}</p> : null}
            {isPics ? (
              <button
                onClick={() => playEnglish(q!.word.audioEn, q!.word.en)}
                className="press focus-ring flex h-28 w-28 items-center justify-center rounded-full bg-lavender text-white [--edge:#6a4fd0]"
                aria-label="მოუსმინე სიტყვას"
              >
                <Volume2 size={52} strokeWidth={2.2} />
              </button>
            ) : null}
          </div>
        </section>

        {/* Answers */}
        <div className={`mt-4 grid gap-3 ${isPics ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
          {q!.options.map((w, idx) => {
            const st = optState(w);
            return (
              <button
                key={w.id}
                onClick={() => choose(w)}
                disabled={answered}
                className={`press focus-ring relative flex items-center gap-3 rounded-2xl border-[3px] text-left font-extrabold transition ${
                  isPics ? "min-h-32 justify-center p-3" : "min-h-16 px-3 py-2.5"
                } ${optCls(st)}`}
              >
                {!isPics ? (
                  <span
                    className={`font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${
                      st === "right" ? "bg-white/70" : st === "wrong" ? "bg-white" : "bg-[var(--soft)] text-[var(--deep)]"
                    }`}
                  >
                    {st === "right" ? <Check size={20} strokeWidth={3.2} /> : st === "wrong" ? <X size={20} strokeWidth={3.2} /> : LETTERS[idx]}
                  </span>
                ) : null}
                {isPics ? (
                  <>
                    <WordArt word={w} size="md" />
                    {st === "right" || st === "wrong" ? (
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white">
                        {st === "right" ? <Check size={18} strokeWidth={3.2} className="text-mint-deep" /> : <X size={18} strokeWidth={3.2} />}
                      </span>
                    ) : null}
                  </>
                ) : q!.type === "en-ka" ? (
                  <span className="font-ka text-lg">{w.ka}</span>
                ) : (
                  <span className="font-display text-2xl font-semibold">{w.en}</span>
                )}
              </button>
            );
          })}
        </div>

        {answered ? (
          <div className="animate-rise mt-4 flex items-center gap-3">
            <Bubble className={`flex-1 !py-3 ${correct ? "" : ""}`} tail="bottom">
              <p className={`font-ka text-lg font-extrabold ${correct ? "text-mint-deep" : "text-coral-deep"}`}>{praise}</p>
              <p className="text-sm text-ink-soft">
                <b className="font-display text-base text-ink">{q!.word.en}</b> = <span className="font-ka">{q!.word.ka}</span>
              </p>
            </Bubble>
            <button
              onClick={next}
              className="press focus-ring font-ka flex min-h-15 shrink-0 items-center gap-1.5 rounded-2xl bg-lavender px-5 text-base font-extrabold text-white [--edge:#6a4fd0]"
            >
              {qi + 1 >= total ? "შედეგი" : "შემდეგი"} <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
