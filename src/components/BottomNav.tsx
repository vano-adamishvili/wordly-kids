"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, Puzzle, Trophy } from "lucide-react";

const ITEMS = [
  { href: "/", label: "მთავარი", Icon: House },
  { href: "/categories", label: "თემები", Icon: LayoutGrid },
  { href: "/quiz", label: "ქვიზი", Icon: Puzzle },
  { href: "/progress", label: "პროგრესი", Icon: Trophy },
];

export default function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/adults")) return null; // adults have their own navigation
  // Hide during focused activities (learn / flashcards / category quiz)
  if (/^\/(category\/[^/]+\/(learn|flashcards|quiz)|daily\/(learn|cards)|review\/[^/]+|opposites)$/.test(path)) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.6rem)]" aria-label="მთავარი ნავიგაცია">
      <ul className="mx-auto flex max-w-md items-stretch justify-between gap-1 rounded-[1.75rem] border border-ink/5 bg-white/95 p-1.5 shadow-[var(--shadow-lift)] backdrop-blur sm:max-w-lg">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.35rem] transition-colors ${
                  active ? "bg-lavender text-white" : "text-ink-soft hover:bg-lavender-soft"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.6 : 2.2} aria-hidden />
                <span className="font-ka text-[0.7rem] font-bold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
