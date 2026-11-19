"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Mic, Volume2 } from "lucide-react";
import { playEnglish, tryPlay } from "@/lib/audio";

/** Illustration from public/art/ui (decorative). */
export function Art({ name, className = "", alt = "" }: { name: string; className?: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/art/ui/${name}.svg`} alt={alt} aria-hidden={alt ? undefined : true} className={className} draggable={false} />;
}

export function TopBar({ back, title, sub, right }: { back?: string; title: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-cream/85 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur-md">
      <div className="flex items-center gap-3">
        {back ? (
          <Link
            href={back}
            aria-label="უკან"
            className="press focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-ink"
          >
            <ArrowLeft size={24} strokeWidth={2.6} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-xl font-semibold leading-tight">{title}</h1>
          {sub ? <p className="truncate text-xs font-bold text-ink-soft">{sub}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}

export function ProgressBar({
  value,
  max,
  color = "var(--color-lavender)",
  track = "rgb(37 36 66 / 0.07)",
  className = "",
  height = 12,
}: {
  value: number;
  max: number;
  color?: string;
  track?: string;
  className?: string;
  height?: number;
}) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${className}`}
      style={{ height, background: track }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="relative h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: color, minWidth: pct ? height : 0 }}
      >
        <span className="absolute inset-x-1 top-[18%] h-[28%] rounded-full bg-white/35" />
      </div>
    </div>
  );
}

/** Circular progress ring. */
export function Ring({
  value,
  max,
  size = 64,
  stroke = 8,
  color = "var(--color-lavender)",
  track = "rgb(37 36 66 / 0.08)",
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(1, value / max) : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
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
  variant?: "brand" | "soft" | "white";
}) {
  const [busy, setBusy] = useState(false);
  const dim = size === "lg" ? "h-16 min-w-16 px-5" : size === "sm" ? "h-11 min-w-11 px-2.5" : "h-13 min-w-13 px-4";
  const icon = size === "lg" ? 30 : size === "sm" ? 20 : 24;
  const color =
    variant === "brand"
      ? "bg-lavender text-white [--edge:#6a4fd0]"
      : variant === "white"
        ? "bg-white text-lavender-deep"
        : "bg-lavender-soft text-lavender-deep [--edge:#d9cffa]";
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        await playEnglish(src, text);
        setTimeout(() => setBusy(false), 700);
      }}
      aria-label={label ? `${label}: ${text}` : `მოუსმინე: ${text}`}
      className={`press focus-ring inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold ${dim} ${color}`}
    >
      <Volume2 size={icon} strokeWidth={2.5} className={busy ? "animate-pulse" : ""} aria-hidden />
      {label ? <span className="font-ka text-sm">{label}</span> : null}
    </button>
  );
}

/** Parent recording – plays public/audio/parents/NNN.mp3 when it exists. */
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
            setMsg("მშობლის ჩანაწერი ჯერ არ არის");
            setTimeout(() => setMsg(null), 2200);
          }
        }}
        className="press focus-ring inline-flex h-13 items-center gap-2 rounded-2xl bg-coral-soft px-4 font-extrabold text-coral-deep [--edge:#ffd3cf]"
        aria-label="მშობლის ხმა"
      >
        <Mic size={22} strokeWidth={2.5} aria-hidden />
        <span className="font-ka text-sm">მშობლის ხმა</span>
      </button>
      {msg ? (
        <div className="font-ka animate-pop absolute bottom-15 left-1/2 z-10 w-52 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-center text-xs text-white">
          {msg}
        </div>
      ) : null}
    </div>
  );
}

const CONFETTI_COLORS = ["#8B6CE8", "#FFD85A", "#72D9B3", "#FF8D85", "#80C7F4"];

export function Confetti({ count = 50 }: { count?: number }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; dur: number; color: string }[]>([]);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setPieces(
        Array.from({ length: count }, (_, i) => ({
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          dur: 1.8 + Math.random() * 1.4,
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
  const map = {
    learned: { cls: "bg-mint text-white", label: "ნასწავლი", icon: "✓" },
    learning: { cls: "bg-sun text-ink", label: "ვსწავლობ", icon: "•" },
    new: { cls: "bg-ink/8 text-ink-soft", label: "ახალი", icon: "" },
  }[status];
  return (
    <span title={map.label} aria-label={map.label} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${map.cls}`}>
      {map.icon}
    </span>
  );
}

/** Speech bubble used next to Wobble. */
export function Bubble({ children, className = "", tail = "left" }: { children: ReactNode; className?: string; tail?: "left" | "bottom" }) {
  return (
    <div className={`relative rounded-3xl bg-white px-4 py-3 shadow-[var(--shadow-soft)] ${className}`}>
      {children}
      <span
        aria-hidden
        className={`absolute h-4 w-4 rotate-45 bg-white ${tail === "left" ? "-left-1.5 top-1/2 -translate-y-1/2" : "-bottom-1.5 left-10"}`}
      />
    </div>
  );
}
