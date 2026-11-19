"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { playEnglish, tryPlay } from "@/lib/audio";

export function TopBar({ back, title, right }: { back?: string; title: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-[#fbf9ff]/85 px-4 py-3 backdrop-blur">
      {back ? (
        <Link
          href={back}
          aria-label="უკან"
          className="btn-3d flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-brand ring-1 ring-violet-100"
        >
          ←
        </Link>
      ) : null}
      <h1 className="font-ka min-w-0 flex-1 truncate text-lg font-extrabold">{title}</h1>
      {right}
    </header>
  );
}

export function ProgressBar({ value, max, color = "bg-brand", className = "" }: { value: number; max: number; color?: string; className?: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-white/80 ring-1 ring-black/5 ${className}`}>
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Speaker button – plays the recorded mp3 if present, else browser TTS. */
export function SpeakButton({
  src,
  text,
  label,
  size = "md",
  variant = "brand",
}: {
  src: string;
  text: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "soft";
}) {
  const [busy, setBusy] = useState(false);
  const cls =
    size === "lg" ? "h-16 min-w-16 text-3xl px-4" : size === "sm" ? "h-10 min-w-10 text-lg px-2.5" : "h-12 min-w-12 text-2xl px-3";
  const color = variant === "brand" ? "bg-brand text-white" : "bg-white text-brand ring-1 ring-violet-200";
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        await playEnglish(src, text);
        setTimeout(() => setBusy(false), 600);
      }}
      aria-label={label ?? `მოუსმინე: ${text}`}
      className={`btn-3d inline-flex items-center justify-center gap-2 rounded-2xl font-bold ${cls} ${color} ${busy ? "scale-95" : ""}`}
    >
      <span aria-hidden>{busy ? "🔊" : "🔈"}</span>
      {label ? <span className="font-ka text-sm">{label}</span> : null}
    </button>
  );
}

/** Parent recording – only works once a file exists in public/audio/parents. */
export function ParentAudioButton({ src }: { src: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={async (e) => {
          e.stopPropagation();
          const ok = await tryPlay(src);
          if (!ok) {
            setMsg("მშობლის ჩანაწერი ჯერ არ არის 🎙️");
            setTimeout(() => setMsg(null), 2200);
          }
        }}
        className="btn-3d inline-flex h-12 items-center gap-2 rounded-2xl bg-pink-100 px-3 font-bold text-pink-700"
        aria-label="მშობლის ხმა"
      >
        <span aria-hidden>👩‍👧</span>
        <span className="font-ka text-sm">მშობლის ხმა</span>
      </button>
      {msg ? (
        <div className="font-ka animate-pop absolute bottom-14 left-1/2 z-10 w-56 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-center text-xs text-white">
          {msg}
        </div>
      ) : null}
    </div>
  );
}

const CONFETTI_COLORS = ["#6d4aff", "#ffd43b", "#ff6b9a", "#38d9a9", "#4dabf7", "#ff922b"];

export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; dur: number; color: string }[]>([]);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setPieces(
        Array.from({ length: count }, (_, i) => ({
          left: Math.random() * 100,
          delay: Math.random() * 0.6,
          dur: 1.8 + Math.random() * 1.6,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        })),
      ),
    );
    return () => cancelAnimationFrame(id);
  }, [count]);
  return (
    <div aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${p.left}vw`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </div>
  );
}

export function StatusDot({ status }: { status: "new" | "learning" | "learned" }) {
  if (status === "learned") return <span title="ნასწავლი" className="text-base">⭐</span>;
  if (status === "learning") return <span title="ვსწავლობ" className="inline-block h-3 w-3 rounded-full bg-amber-400" />;
  return <span title="ახალი" className="inline-block h-3 w-3 rounded-full bg-slate-200" />;
}
