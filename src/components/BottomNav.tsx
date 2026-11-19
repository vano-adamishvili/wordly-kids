"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "მთავარი", icon: "🏠" },
  { href: "/categories", label: "თემები", icon: "📚" },
  { href: "/quiz", label: "ქვიზი", icon: "🧩" },
  { href: "/progress", label: "პროგრესი", icon: "⭐" },
];

export default function BottomNav() {
  const path = usePathname();
  // Hide during focused activities
  if (/\/(learn|flashcards|quiz)$/.test(path) && path.startsWith("/category/")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-violet-100 bg-white/90 backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 sm:max-w-2xl">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`flex flex-col items-center rounded-2xl px-4 py-1 text-xs font-bold transition ${
                  active ? "bg-violet-100 text-brand" : "text-slate-500"
                }`}
              >
                <span className="text-2xl leading-7">{it.icon}</span>
                <span className="font-ka">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
