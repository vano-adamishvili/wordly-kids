import CategoryGrid from "@/components/CategoryGrid";
import { TopBar } from "@/components/ui";
import { LEVELS } from "@/data/categories";

export const metadata = { title: "თემები · Wivilo" };

export default function CategoriesPage() {
  return (
    <main>
      <TopBar back="/" title="სასწავლო სამყაროები" sub="24 თემა · 240 სიტყვა" />
      <div className="space-y-8 px-4">
        {LEVELS.map(({ level, ka, sub }) => (
          <section key={level} aria-labelledby={`level-${level}`}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id={`level-${level}`} className="font-ka text-lg font-extrabold">
                {ka}
              </h2>
              <span className="font-ka text-xs font-bold text-ink-soft">{sub} · 12 თემა</span>
            </div>
            <CategoryGrid level={level} />
          </section>
        ))}
      </div>
    </main>
  );
}
