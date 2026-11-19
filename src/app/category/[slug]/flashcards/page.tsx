import { notFound } from "next/navigation";
import { CATEGORIES, categoryBySlug } from "@/data/categories";
import FlashcardMode from "@/components/FlashcardMode";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function FlashcardsPage({ params }: PageProps<"/category/[slug]/flashcards">) {
  const { slug } = await params;
  if (!categoryBySlug(slug)) notFound();
  return <FlashcardMode slug={slug} />;
}
