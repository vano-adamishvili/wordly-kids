"use client";

import { useEffect, useState } from "react";
import { staticSetItems, type MaltaItem } from "./malta";
import { adultActions, reviewItems, useAdultProgress } from "./progress";

/** Optional ?lvl=B1|B2 filter (read on the client, so pages stay static). */
export function useLevelParam(): "B1" | "B2" | null {
  const [lvl, setLvl] = useState<"B1" | "B2" | null>(null);
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("lvl");
    if (v === "B1" || v === "B2") {
      const id = requestAnimationFrame(() => setLvl(v));
      return () => cancelAnimationFrame(id);
    }
  }, []);
  return lvl;
}

/**
 * Items of a practice set, fixed once per visit (answering never reshuffles the session).
 * "review" is built from the stored progress.
 */
export function useSetItems(set: string): { items: MaltaItem[] | null; level: "B1" | "B2" | null } {
  const [p, hydrated] = useAdultProgress();
  const [items, setItems] = useState<MaltaItem[] | null>(null);
  const [level, setLevel] = useState<"B1" | "B2" | null>(null);
  useEffect(() => {
    if (!hydrated || items !== null) return;
    const v = new URLSearchParams(window.location.search).get("lvl");
    const lvl = v === "B1" || v === "B2" ? v : null;
    const base = set === "review" ? reviewItems(p) : staticSetItems(set);
    const id = requestAnimationFrame(() => {
      setLevel(lvl);
      setItems(lvl ? base.filter((i) => i.level === lvl) : base);
    });
    if (set !== "review") adultActions.setLastSet(set);
    return () => cancelAnimationFrame(id);
  }, [hydrated, items, p, set]);
  return { items, level };
}
