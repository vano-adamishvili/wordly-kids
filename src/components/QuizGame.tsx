"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EMOJI } from "@/data/emoji";
import { playEnglish } from "@/lib/audio";
import { progressActions, statusOf, useProgress } from "@/lib/progress";
import { shuffle, WORDS, wordsForCategory, type Word } from "@/lib/words";
import WordArt from "./WordArt";
import { Confetti, ProgressBar, SpeakButton, TopBar } from "./ui";

type QType = "pic-en" | "en-ka" | "ka-en" | "listen-pic";
type Question = { type: QType; word: Word; options: Word[] };

const PROMPTS: Record<QType, string> = {
  "pic-en": "რა არის სურათზე? აირჩიე ინგლისური სიტყვა",
  "en-ka": "რას ნიშნავს ეს სიტყვა ქართულად?",
  "ka-en": "როგორ არის ინგლისურად?",
  "listen-pic": "მოუსმინე და აირჩიე სწორი სურათი",
};

const PRAISE = ["ყოჩაღ! 🎉", "სუპერ! ⭐", "მშვენიერია! 🌟", "ზუსტად! 👏", "შესანიშნავია! 🚀"];

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
        (type !== "listen-pic" || EMOJI[w.id] !== EMOJI[word.id]),
    );
    const picked: Word[] = [];
    for (const c of candidates) {
      if (picked.length === 3) break;
      if (type === "listen-pic" && picked.some((p) => EMOJI[p.id] === EMOJI[c.id])) continue;
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
      <main>
        <TopBar back={back} title={title} />
        <div className="font-ka mt-20 text-center text-slate-400">იტვირთება… 🧩</div>
      </main>
    );
  }

  const total = questions.length;

  if (qi >= total) {
    const pct = score / total;
    const stars = score === total ? 3 : pct >= 0.7 ? 2 : score > 0 ? 1 : 0;
    return (
      <main>
        {pct >= 0.7 ? <Confetti /> : null}
        <TopBar back={back} title={title} />
        <div className="animate-pop mx-4 mt-4 rounded-[2rem] bg-white p-6 text-center ring-2 ring-violet-100">
          <div className="text-6xl">{pct === 1 ? "🏆" : pct >= 0.7 ? "🥳" : pct >= 0.4 ? "💪" : "🌱"}</div>
          <p className="font-ka mt-2 text-2xl font-extrabold">
            {pct === 1 ? "უნაკლოდ!" : pct >= 0.7 ? "ძალიან კარგია!" : pct >= 0.4 ? "კარგი ცდაა!" : "ვივარჯიშოთ კიდევ!"}
          </p>
          <p className="mt-2 text-5xl font-black text-brand">
            {score}/{total}
          </p>
          <div className="mt-2 text-4xl tracking-widest">
            {[0, 1, 2].map((s) => (
              <span key={s} className={s < stars ? "" : "opacity-20 grayscale"}>
                ⭐
              </span>
            ))}
          </div>
          <p className="font-ka text-sm text-slate-500">+{stars} ვარსკვლავი</p>

          {mistakes.length ? (
            <div className="mt-5 text-left">
              <p className="font-ka mb-2 text-sm font-extrabold text-slate-600">გავიმეოროთ ეს სიტყვები:</p>
              <ul className="space-y-2">
                {mistakes.map((w) => (
                  <li key={w.id} className="flex items-center gap-3 rounded-2xl bg-amber-50 p-2">
                    <WordArt word={w} size="sm" />
                    <div className="flex-1">
                      <p className="font-extrabold">{w.en}</p>
                      <p className="font-ka text-sm text-slate-500">{w.ka}</p>
                    </div>
                    <SpeakButton src={w.audioEn} text={w.en} size="sm" variant="soft" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            <button onClick={start} className="btn-3d font-ka rounded-2xl bg-brand py-3 text-lg font-bold text-white">
              🔁 კიდევ ერთხელ
            </button>
            <Link href={back} className="btn-3d font-ka rounded-2xl bg-white py-3 font-bold text-brand ring-1 ring-violet-200">
              ← დაბრუნება
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
      ? "bg-emerald-500 text-white ring-emerald-600"
      : s === "wrong"
        ? "animate-wiggle bg-rose-500 text-white ring-rose-600"
        : s === "dim"
          ? "bg-white opacity-50 ring-violet-100"
          : "bg-white ring-violet-200 hover:bg-violet-50";

  return (
    <main>
      <TopBar back={back} title={title} right={<span className="text-lg font-black">⭐ {score}</span>} />
      <div className="px-4">
        <div className="mb-4 flex items-center gap-3">
          <ProgressBar value={qi} max={total} color="bg-amber-400" />
          <span className="shrink-0 text-sm font-extrabold text-slate-500">
            {qi + 1}/{total}
          </span>
        </div>

        <section key={qi} className="animate-pop rounded-[2rem] border-[3px] border-brand bg-white p-5 text-center shadow-[0_10px_0_0_#e4dcff]">
          <p className="font-ka text-sm font-bold text-slate-500">{PROMPTS[q!.type]}</p>
          <div className="mt-3 flex min-h-40 flex-col items-center justify-center gap-3">
            {q!.type === "pic-en" ? <WordArt word={q!.word} size="lg" /> : null}
            {q!.type === "en-ka" ? (
              <>
                <p className="text-5xl font-black">{q!.word.en}</p>
                <SpeakButton src={q!.word.audioEn} text={q!.word.en} />
              </>
            ) : null}
            {q!.type === "ka-en" ? <p className="font-ka rounded-2xl bg-sun px-5 py-2 text-4xl font-extrabold">{q!.word.ka}</p> : null}
            {q!.type === "listen-pic" ? (
              <button
                onClick={() => playEnglish(q!.word.audioEn, q!.word.en)}
                className="btn-3d flex h-28 w-28 items-center justify-center rounded-full bg-brand text-6xl text-white"
                aria-label="მოუსმინე"
              >
                🔊
              </button>
            ) : null}
          </div>
        </section>

        <div className={`mt-5 grid gap-3 ${q!.type === "listen-pic" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
          {q!.options.map((w) => (
            <button
              key={w.id}
              onClick={() => choose(w)}
              disabled={answered}
              className={`btn-3d rounded-2xl px-4 py-4 text-xl font-extrabold ring-2 transition ${optCls(optState(w))}`}
            >
              {q!.type === "listen-pic" ? (
                <span className="flex justify-center">
                  <WordArt word={w} size="md" />
                </span>
              ) : q!.type === "en-ka" ? (
                <span className="font-ka">{w.ka}</span>
              ) : (
                w.en
              )}
            </button>
          ))}
        </div>

        {answered ? (
          <div
            className={`animate-pop mt-5 flex items-center gap-3 rounded-2xl p-4 ${correct ? "bg-emerald-50 ring-2 ring-emerald-200" : "bg-rose-50 ring-2 ring-rose-200"}`}
          >
            <div className="flex-1">
              <p className="font-ka text-lg font-extrabold">{correct ? praise : "არა უშავს! 🙂"}</p>
              <p className="font-ka text-sm text-slate-600">
                <b className="font-sans">{q!.word.en}</b> = {q!.word.ka}
              </p>
            </div>
            <button onClick={next} className="btn-3d font-ka rounded-2xl bg-brand px-5 py-3 font-extrabold text-white">
              {qi + 1 >= total ? "შედეგი" : "შემდეგი →"}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
