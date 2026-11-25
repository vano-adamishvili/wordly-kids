"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronRight, Eye, Flag, Info } from "lucide-react";
import { highlight, itemById, SCENARIOS, type Scenario } from "@/lib/adult/malta";
import { adultActions } from "@/lib/adult/progress";
import Wivi from "../Wivi";
import { AdultTopBar, Bar, SayButton, SpeedToggle } from "./ui";

/** Self-practice: read the situation, answer out loud, reveal the model answer. No speech scoring. */
export default function AdultTalk() {
  const [sc, setSc] = useState<Scenario | null>(null);
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(false);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState<boolean[]>([]);

  if (!sc) {
    return (
      <main className="pb-24">
        <AdultTopBar back="/adults" title="სასაუბრო პრაქტიკა" sub="სიტუაცია → შენი პასუხი → ნიმუში" right={<SpeedToggle />} />
        <div className="space-y-3 px-4 pt-3 lg:mx-auto lg:max-w-xl">
          <div className="flex items-start gap-2 rounded-xl bg-white p-3 shadow-[var(--shadow-soft)]">
            <Info size={18} className="mt-0.5 shrink-0 text-lavender-deep" />
            <p className="font-ka text-xs text-ink-soft">
              წაიკითხე სიტუაცია, თქვი ან დაწერე პასუხი ინგლისურად, მერე ნახე ნიმუში და მოუსმინე. აპი გამოთქმას არ აფასებს — შენ თავად აღნიშნავ, გამოგივიდა თუ არა.
            </p>
          </div>
          <ul className="card divide-y divide-ink/5 overflow-hidden rounded-2xl">
            {SCENARIOS.map((s) => (
              <li key={s.slug}>
                <button
                  onClick={() => {
                    setSc(s);
                    setStep(0);
                    setShown(false);
                    setDraft("");
                    setResults([]);
                  }}
                  className="focus-ring flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream"
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-ka block text-sm font-extrabold">{s.title}</span>
                    <span className="font-ka block truncate text-xs text-ink-soft">{s.setting}</span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-ink-soft">{s.ids.length}</span>
                  <ChevronRight size={18} className="text-ink-soft" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  const top = <AdultTopBar back="/adults/talk" title={sc.title} sub="სასაუბრო პრაქტიკა" right={<SpeedToggle />} />;
  if (step >= sc.ids.length) {
    const ok = results.filter(Boolean).length;
    return (
      <main className="lg:mx-auto lg:max-w-xl">
        {top}
        <div className="card mx-4 mt-4 flex flex-col items-center rounded-2xl p-6 text-center">
          <Wivi mood={ok === results.length ? "cheering" : "encouraging"} size={72} animate={false} />
          <p className="font-ka mt-2 text-lg font-extrabold">სიტუაცია გავლილია</p>
          <p className="font-ka text-sm text-ink-soft">
            გამოგივიდა: {ok}/{results.length}. „გასავარჯიშებელი“ ფრაზები გამეორებაში დაემატა.
          </p>
          <div className="mt-5 grid w-full grid-cols-2 gap-2">
            <button onClick={() => setSc(null)} className="focus-ring font-ka min-h-12 rounded-xl bg-lavender-soft font-extrabold text-lavender-deep">
              სხვა სიტუაცია
            </button>
            <button
              onClick={() => {
                setStep(0);
                setResults([]);
                setShown(false);
              }}
              className="focus-ring font-ka min-h-12 rounded-xl bg-lavender font-extrabold text-white"
            >
              თავიდან
            </button>
          </div>
        </div>
      </main>
    );
  }

  const it = itemById(sc.ids[step])!;
  const rate = (good: boolean) => {
    adultActions.rate(it.id, good);
    setResults((r) => [...r, good]);
    setShown(false);
    setDraft("");
    setStep((s) => s + 1);
  };

  return (
    <main className="lg:mx-auto lg:max-w-xl">
      {top}
      <div className="px-4 pt-3">
        <div className="mb-3 flex items-center gap-3">
          <Bar value={step} max={sc.ids.length} />
          <span className="shrink-0 text-xs font-extrabold text-ink-soft">
            {step + 1}/{sc.ids.length}
          </span>
        </div>
        <section key={it.id} className="animate-rise card rounded-2xl p-4">
          <p className="font-ka text-xs font-bold uppercase tracking-wide text-ink-soft">სიტუაცია</p>
          <p className="font-ka mt-1 text-sm text-ink-soft">{sc.setting}</p>
          <p className="font-ka mt-4 text-xs font-bold text-ink-soft">როგორ იტყვით ინგლისურად:</p>
          <p className="font-ka mt-1 text-lg font-extrabold leading-snug">„{it.sentenceKa}“</p>
          <p className="font-ka mt-2 text-xs text-ink-soft">
            გამოიყენე: <b className="text-lavender-deep">{it.ka}</b>
          </p>
          <label className="font-ka mt-4 block text-xs font-bold text-ink-soft" htmlFor="draft">
            შენი პასუხი (არასავალდებულო — შეგიძლია ხმამაღლა თქვა)
          </label>
          <textarea
            id="draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            lang="en"
            autoCapitalize="sentences"
            className="focus-ring mt-1 w-full resize-none rounded-xl border border-ink/10 bg-cream px-3 py-2 text-base"
            placeholder="Type your answer…"
          />
          {!shown ? (
            <button onClick={() => setShown(true)} className="focus-ring font-ka mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lavender font-extrabold text-white">
              <Eye size={18} /> ნიმუშის ჩვენება
            </button>
          ) : (
            <div className="animate-rise mt-3 rounded-xl bg-sky-soft p-3.5">
              <p className="font-ka text-xs font-bold text-ink-soft">ნიმუში</p>
              <p className="mt-1 text-[1.05rem] font-semibold leading-snug">
                {highlight(it.sentenceEn, it.en).map((p, k) =>
                  p.hit ? (
                    <mark key={k} className="rounded bg-sun px-0.5">
                      {p.text}
                    </mark>
                  ) : (
                    <span key={k}>{p.text}</span>
                  ),
                )}
              </p>
              <div className="mt-2.5">
                <SayButton text={it.sentenceEn} file={it.sentenceAudio} label="მოსმენა" size="sm" />
              </div>
            </div>
          )}
        </section>
        {shown ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => rate(false)} className="focus-ring font-ka flex h-13 items-center justify-center gap-1.5 rounded-xl bg-coral-soft text-sm font-extrabold text-coral-deep">
              <Flag size={18} /> გასავარჯიშებელია
            </button>
            <button onClick={() => rate(true)} className="focus-ring font-ka flex h-13 items-center justify-center gap-1.5 rounded-xl bg-mint text-sm font-extrabold text-ink">
              <Check size={20} strokeWidth={3} /> გამომივიდა
            </button>
          </div>
        ) : (
          <button onClick={() => setStep((s) => s + 1)} className="focus-ring font-ka mt-3 flex h-11 w-full items-center justify-center gap-1 text-sm font-bold text-ink-soft">
            გამოტოვება <ArrowRight size={16} />
          </button>
        )}
      </div>
    </main>
  );
}
