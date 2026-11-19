import CategoryGrid from "@/components/CategoryGrid";
import { TopBar } from "@/components/ui";

export const metadata = { title: "თემები · Wordly Kids" };

export default function CategoriesPage() {
  return (
    <main>
      <TopBar back="/" title="📚 ყველა თემა" />
      <div className="px-4">
        <p className="font-ka mb-4 text-sm text-slate-500">აირჩიე თემა და დაიწყე სწავლა. თითოეულში 10 სიტყვაა.</p>
        <CategoryGrid />
      </div>
    </main>
  );
}
