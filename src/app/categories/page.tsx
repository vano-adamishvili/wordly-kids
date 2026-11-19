import CategoryGrid from "@/components/CategoryGrid";
import { TopBar } from "@/components/ui";

export const metadata = { title: "თემები · Wordly Kids" };

export default function CategoriesPage() {
  return (
    <main>
      <TopBar back="/" title="სასწავლო სამყაროები" />
      <div className="px-4">
        <p className="font-ka mb-4 text-sm text-ink-soft">აირჩიე თემა და დაიწყე სწავლა. თითოეულში 10 სიტყვაა.</p>
        <CategoryGrid />
      </div>
    </main>
  );
}
