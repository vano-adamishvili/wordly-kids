"use client";

import { MALTA_CATEGORIES, staticSetItems } from "@/lib/adult/malta";
import { statusOfItem, useAdultProgress } from "@/lib/adult/progress";
import { CategoryRow } from "./AdultDashboard";
import { AdultTopBar, SpeedToggle } from "./ui";

export default function AdultCategories() {
  const [p, hydrated] = useAdultProgress();
  return (
    <main className="pb-24">
      <AdultTopBar back="/adults" title="კატეგორიები" sub="15 კატეგორია · 10 ერთეული თითოში" right={<SpeedToggle />} />
      <div className="px-4 pt-3 lg:mx-auto lg:max-w-3xl">
        <ul className="card divide-y divide-ink/5 overflow-hidden rounded-2xl">
          {MALTA_CATEGORIES.map((c) => (
            <CategoryRow
              key={c.slug}
              slug={c.slug}
              ka={c.ka}
              en={c.en}
              known={hydrated ? staticSetItems(c.slug).filter((i) => statusOfItem(p, i.id) === "known").length : 0}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
