import { notFound } from "next/navigation";
import { CATEGORIES, categoryBySlug } from "@/data/categories";
import FlashcardMode from "@/components/FlashcardMode";
import { wordsForCategory } from "@/lib/words";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function FlashcardsPage({ params }: PageProps<"/category/[slug]/flashcards">) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) notFound();
  return <FlashcardMode words={wordsForCategory(slug)} slug={slug} title={c.ka} back={`/category/${slug}`} />;
}
