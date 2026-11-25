"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { MALTA_CATEGORIES, MALTA_ITEMS, setLabel, staticSetItems } from "@/lib/adult/malta";
import { adultActions, adultBackupJSON, isDue, parseAdultBackup, statusOfItem, useAdultProgress, type AdultProgress as AP } from "@/lib/adult/progress";
import { AdultTopBar, Bar, CatIcon, SpeedToggle } from "./ui";

export default function AdultProgress() {
  const [p, hydrated] = useAdultProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AP | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  if (!hydrated) return <AdultTopBar back="/adults" title="პროგრესი" />;

  const st = (id: string) => statusOfItem(p, id);
  const studied = MALTA_ITEMS.filter((i) => st(i.id) !== "new").length;
  const known = MALTA_ITEMS.filter((i) => st(i.id) === "known").length;
  const difficult = MALTA_ITEMS.filter((i) => p.items[i.id]?.difficult).length;
  const due = MALTA_ITEMS.filter((i) => isDue(p, i.id)).length;
  const lvl = (l: "B1" | "B2") => MALTA_ITEMS.filter((i) => i.level === l && st(i.id) === "known").length;
  const quizzes = Object.entries(p.quizzes);

  return (
    <main className="pb-24">
      <AdultTopBar back="/adults" title="პროგრესი" sub="Malta Travel English · ცალკე ბავშვის პროგრესისგან" right={<SpeedToggle />} />
      <div className="space-y-4 px-4 pt-3 lg:mx-auto lg:max-w-3xl">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat value={studied} label="ნანახი" />
          <Stat value={known} label="ნასწავლი" />
          <Stat value={difficult} label="რთული" />
          <Stat value={due} label="გასამეორებელი" />
        </section>

        <section className="card rounded-2xl p-4">
          <p className="font-ka mb-3 text-sm font-extrabold">დონეები</p>
          {(["B1", "B2"] as const).map((l) => (
            <div key={l} className="mb-2 flex items-center gap-3 last:mb-0">
              <span className="w-8 text-sm font-extrabold">{l}</span>
              <Bar value={lvl(l)} max={75} color={l === "B1" ? "var(--color-mint)" : "var(--color-lavender)"} />
              <span className="w-12 shrink-0 text-right text-xs font-extrabold">{lvl(l)}/75</span>
            </div>
          ))}
          <p className="font-ka mt-2 text-xs text-ink-soft">
            Travel Essentials: {staticSetItems("essentials").filter((i) => st(i.id) === "known").length}/30
          </p>
        </section>

        <section className="card rounded-2xl p-4">
          <p className="font-ka mb-2 text-sm font-extrabold">
            კატეგორიები · დასრულებული {MALTA_CATEGORIES.filter((c) => staticSetItems(c.slug).every((i) => st(i.id) === "known")).length}/15
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MALTA_CATEGORIES.map((c) => {
              const k = staticSetItems(c.slug).filter((i) => st(i.id) === "known").length;
              return (
                <li key={c.slug} className="flex items-center gap-2">
                  <CatIcon slug={c.slug} size={16} className="shrink-0 text-lavender-deep" />
                  <span className="font-ka min-w-0 flex-1 truncate text-xs font-bold">{c.ka}</span>
                  <div className="w-16 shrink-0">
                    <Bar value={k} max={10} />
                  </div>
                  <span className="w-9 shrink-0 text-right text-xs font-extrabold">{k}/10</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card rounded-2xl p-4">
          <p className="font-ka mb-2 text-sm font-extrabold">ქვიზის შედეგები</p>
          {quizzes.length === 0 ? (
            <p className="font-ka text-xs text-ink-soft">ჯერ ქვიზი არ გაგივლია.</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {quizzes.map(([k, q]) => {
                const [mode, set, lv] = k.split(":");
                return (
                  <li key={k} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="font-ka min-w-0 truncate">
                      {mode === "listen" ? "მოსმენა" : "ქვიზი"} · {setLabel(set)}
                      {lv ? ` · ${lv}` : ""}
                    </span>
                    <span className="shrink-0 text-xs font-extrabold">
                      ბოლო {q.last}/{q.total} · საუკ. {q.best} · {q.plays}×
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card rounded-2xl p-4">
          <p className="font-ka text-sm font-extrabold">სარეზერვო ასლი</p>
          <p className="font-ka mt-1 text-xs text-ink-soft">მოზრდილის პროგრესი ცალკე ფაილად ინახება (ბავშვის პროგრესი მასში არ შედის).</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const url = URL.createObjectURL(new Blob([adultBackupJSON(p)], { type: "application/json" }));
                const a = document.createElement("a");
                const d = new Date();
                a.href = url;
                a.download = `wivilo-adult-progress-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
              className="focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lavender text-sm font-extrabold text-white"
            >
              <Download size={18} /> ჩამოტვირთვა
            </button>
            <button onClick={() => fileRef.current?.click()} className="focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lavender-soft text-sm font-extrabold text-lavender-deep">
              <Upload size={18} /> აღდგენა
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const r = parseAdultBackup(await f.text());
                if (typeof r === "string") setMsg(r);
                else {
                  setPending(r);
                  setMsg(null);
                }
              }}
            />
          </div>
          {pending ? (
            <div className="mt-3 rounded-xl bg-sun-soft p-3">
              <p className="font-ka text-sm font-bold">აღვადგინოთ? ფაილში {Object.values(pending.items).filter((i) => i.status === "known").length} ნასწავლი ერთეულია.</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    adultActions.restore(pending);
                    setPending(null);
                    setMsg("პროგრესი აღდგა.");
                  }}
                  className="focus-ring font-ka min-h-11 rounded-xl bg-lavender px-4 text-sm font-extrabold text-white"
                >
                  დიახ
                </button>
                <button onClick={() => setPending(null)} className="focus-ring font-ka min-h-11 rounded-xl bg-white px-4 text-sm font-extrabold">
                  გაუქმება
                </button>
              </div>
            </div>
          ) : null}
          {msg ? (
            <p className="font-ka mt-2 text-sm font-bold text-mint-deep" role="status">
              {msg}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="card rounded-2xl p-3">
      <p className="text-2xl font-extrabold leading-none">{value}</p>
      <p className="font-ka mt-1 text-xs font-bold text-ink-soft">{label}</p>
    </div>
  );
}
