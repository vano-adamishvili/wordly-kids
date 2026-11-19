"use client";

import { useRef, useState } from "react";
import { Download, ShieldCheck, Upload } from "lucide-react";
import { BACKUP_KEY, backupJSON, parseBackup, progressActions, useProgress, type Progress } from "@/lib/progress";

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Export / restore of the learning progress (parent area). */
export default function BackupPanel() {
  const [p] = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Progress | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const hasOld = (() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(BACKUP_KEY) !== null;
    } catch {
      return false;
    }
  })();

  return (
    <section id="backup" className="card scroll-mt-24 p-5 lg:col-span-2">
      <div className="flex items-center gap-2">
        <ShieldCheck size={22} className="text-mint-deep" />
        <p className="font-ka font-extrabold">სარეზერვო ასლი (მშობლისთვის)</p>
      </div>
      <p className="font-ka mt-1 text-xs text-ink-soft">
        პროგრესი ინახება ამ ბრაუზერში და ამ მისამართზე. ახალ მისამართზე (მაგ. wivilo.ge) ან სხვა მოწყობილობაზე გადასატანად ჩამოტვირთე ფაილი აქ და იქ აღადგინე „ფაილიდან აღდგენით“.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => {
            download(`wivilo-progress-${stamp}.json`, backupJSON(p));
            setMsg("ფაილი ჩამოიტვირთა.");
          }}
          className="press focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lavender text-sm font-extrabold text-white [--edge:#6a4fd0]"
        >
          <Download size={18} /> პროგრესის ჩამოტვირთვა
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="press focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lavender-soft text-sm font-extrabold text-lavender-deep [--edge:#d9cffa]"
        >
          <Upload size={18} /> ფაილიდან აღდგენა
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
            const res = parseBackup(await f.text());
            if (typeof res === "string") setMsg(res);
            else {
              setPending(res);
              setMsg(null);
            }
          }}
        />
      </div>
      {hasOld ? (
        <button
          onClick={() => {
            try {
              const raw = window.localStorage.getItem(BACKUP_KEY);
              if (raw) download(`wivilo-progress-before-level2.json`, backupJSON(JSON.parse(raw)));
            } catch {}
          }}
          className="focus-ring font-ka mt-2 min-h-10 text-xs font-bold text-lavender-deep underline"
        >
          დონე 2-მდე შენახული ავტომატური ასლის ჩამოტვირთვა
        </button>
      ) : null}
      {pending ? (
        <div className="mt-3 rounded-2xl bg-sun-soft p-3">
          <p className="font-ka text-sm font-bold">
            აღვადგინოთ ფაილიდან? ფაილში: {Object.values(pending.words).filter((w) => w.status === "learned").length} ნასწავლი სიტყვა, {pending.stars} ვარსკვლავი,{" "}
            {Object.keys(pending.quizzes ?? {}).length} ქვიზის შედეგი. ამჟამინდელი პროგრესიც შეინახება ასლად.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                progressActions.restore(pending);
                setPending(null);
                setMsg("პროგრესი აღდგა და შენახულია ამ ბრაუზერში.");
              }}
              className="press focus-ring font-ka min-h-11 rounded-xl bg-lavender px-4 text-sm font-extrabold text-white [--edge:#6a4fd0]"
            >
              დიახ, აღადგინე
            </button>
            <button onClick={() => setPending(null)} className="press focus-ring font-ka min-h-11 rounded-xl bg-white px-4 text-sm font-extrabold">
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
  );
}
