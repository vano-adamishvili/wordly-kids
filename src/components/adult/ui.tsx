"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft, BarChart3, Camera, CloudSun, Coffee, Compass, Hotel, House, LayoutGrid, LifeBuoy, Landmark, Map, MessageCircle,
  Plane, Repeat, Ship, Snail, Ticket, TramFront, UtensilsCrossed, Volume2, Wallet,
} from "lucide-react";
import { speak, tryPlay } from "@/lib/audio";
import { adultActions, useAdultProgress } from "@/lib/adult/progress";
import Wivi from "../Wivi";
import { WiviloWordmark } from "../brand/WiviloLogo";

export const CAT_ICONS: Record<string, typeof Plane> = {
  "airport-arrival": Plane,
  "hotel-accommodation": Hotel,
  "public-transport-taxis": TramFront,
  "ferries-gozo": Ship,
  "directions-navigation": Compass,
  "restaurants-service": UtensilsCrossed,
  "maltese-food-cafes": Coffee,
  "history-sightseeing": Landmark,
  "tours-activities": Map,
  "weather-sea": CloudSun,
  "tickets-reservations": Ticket,
  "money-shopping": Wallet,
  "polite-conversation": MessageCircle,
  "problems-assistance": LifeBuoy,
  "photography-flexible-plans": Camera,
};

export function CatIcon({ slug, size = 20, className = "" }: { slug: string; size?: number; className?: string }) {
  const I = CAT_ICONS[slug] ?? MessageCircle;
  return <I size={size} strokeWidth={2.2} className={className} aria-hidden />;
}

export function LevelBadge({ level }: { level: "B1" | "B2" }) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[0.7rem] font-extrabold tracking-wide ${
        level === "B1" ? "bg-mint-soft text-mint-deep" : "bg-lavender-soft text-lavender-deep"
      }`}
    >
      {level}
    </span>
  );
}

/** Space switch: Kids / Adults */
export function SpaceSwitch({ active }: { active: "kids" | "adults" }) {
  return (
    <nav aria-label="სივრცე" className="flex rounded-xl bg-ink/5 p-0.5 text-xs font-extrabold">
      <Link
        href="/"
        aria-current={active === "kids" ? "page" : undefined}
        className={`font-ka focus-ring rounded-lg px-2.5 py-1.5 ${active === "kids" ? "bg-white text-ink shadow-[var(--shadow-soft)]" : "text-ink-soft"}`}
      >
        ბავშვები
      </Link>
      <Link
        href="/adults"
        aria-current={active === "adults" ? "page" : undefined}
        className={`font-ka focus-ring rounded-lg px-2.5 py-1.5 ${active === "adults" ? "bg-white text-ink shadow-[var(--shadow-soft)]" : "text-ink-soft"}`}
      >
        მოზრდილები
      </Link>
    </nav>
  );
}

export function AdultTopBar({ back, title, sub, right }: { back?: string; title?: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-cream/90 px-4 pb-2.5 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur-md">
      <div className="flex items-center gap-3">
        {back ? (
          <Link href={back} aria-label="უკან" className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-ink shadow-[var(--shadow-soft)]">
            <ArrowLeft size={22} strokeWidth={2.4} />
          </Link>
        ) : (
          <Link href="/adults" className="focus-ring flex items-center gap-1 rounded-lg" aria-label="Wivilo — მოზრდილები">
            <Wivi mood="happy" size={30} animate={false} />
            <WiviloWordmark height={20} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {title ? <h1 className="font-ka truncate text-base font-extrabold leading-tight">{title}</h1> : null}
          {sub ? <p className="font-ka truncate text-xs font-semibold text-ink-soft">{sub}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}

/** Normal / slow speech toggle (saved in adult settings). */
export function SpeedToggle() {
  const [p] = useAdultProgress();
  const slow = !!p.slowAudio;
  return (
    <button
      onClick={() => adultActions.setSlow(!slow)}
      aria-pressed={slow}
      aria-label={slow ? "ნელი გამოთქმა ჩართულია" : "ნორმალური სიჩქარე"}
      className={`focus-ring flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold shadow-[var(--shadow-soft)] ${
        slow ? "bg-sun text-ink" : "bg-white text-ink-soft"
      }`}
    >
      <Snail size={18} />
      <span className="font-ka">{slow ? "ნელა" : "ნორმ."}</span>
    </button>
  );
}

/** Speaks English with the browser voice (recorded file first, if one exists). */
export function useSay() {
  const [p] = useAdultProgress();
  return async (text: string, opts: { slow?: boolean; file?: string } = {}) => {
    const slow = opts.slow ?? !!p.slowAudio;
    if (opts.file && !slow && (await tryPlay(opts.file))) return;
    speak(text, slow ? 0.62 : 0.92);
  };
}

export function SayButton({
  text,
  file,
  label,
  variant = "primary",
  size = "md",
}: {
  text: string;
  file?: string;
  label?: string;
  variant?: "primary" | "soft";
  size?: "sm" | "md";
}) {
  const say = useSay();
  const [busy, setBusy] = useState(false);
  return (
    <span className="inline-flex overflow-hidden rounded-xl shadow-[var(--shadow-soft)]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setBusy(true);
          say(text, { file });
          setTimeout(() => setBusy(false), 700);
        }}
        aria-label={`მოუსმინე${label ? ` (${label})` : ""}: ${text}`}
        className={`focus-ring inline-flex items-center gap-1.5 font-extrabold ${size === "sm" ? "h-10 px-2.5" : "h-11 px-3.5"} ${
          variant === "primary" ? "bg-lavender text-white" : "bg-white text-lavender-deep"
        }`}
      >
        <Volume2 size={size === "sm" ? 18 : 20} className={busy ? "animate-pulse" : ""} />
        {label ? <span className="font-ka text-sm">{label}</span> : null}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          say(text, { slow: true });
        }}
        aria-label={`ნელა: ${text}`}
        title="ნელა"
        className={`focus-ring inline-flex items-center border-l ${size === "sm" ? "h-10 px-2" : "h-11 px-2.5"} ${
          variant === "primary" ? "border-white/25 bg-lavender-deep text-white" : "border-ink/5 bg-white text-ink-soft"
        }`}
      >
        <Snail size={16} />
      </button>
    </span>
  );
}

export function Bar({ value, max, color = "var(--color-lavender)", className = "" }: { value: number; max: number; color?: string; className?: string }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-ink/8 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

const NAV = [
  { href: "/adults", label: "მთავარი", Icon: House, exact: true },
  { href: "/adults/categories", label: "კატეგორიები", Icon: LayoutGrid },
  { href: "/adults/cards/review", label: "გამეორება", Icon: Repeat },
  { href: "/adults/progress", label: "პროგრესი", Icon: BarChart3 },
];

export function AdultNav() {
  const path = usePathname();
  if (/^\/adults\/(learn|cards|quiz|listen|talk)\//.test(path) && path !== "/adults/cards/review") return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/5 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 backdrop-blur" aria-label="მოზრდილების ნავიგაცია">
      <ul className="mx-auto flex max-w-md justify-between px-2 sm:max-w-lg">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-xl ${active ? "text-lavender-deep" : "text-ink-soft"}`}
              >
                <Icon size={21} strokeWidth={active ? 2.6 : 2.1} />
                <span className="font-ka text-[0.68rem] font-bold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
