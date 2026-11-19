import { notFound } from "next/navigation";
import { CATEGORIES, categoryBySlug } from "@/data/categories";
import LearnMode from "@/components/LearnMode";
import { wordsForCategory } from "@/lib/words";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function LearnPage({ params }: PageProps<"/category/[slug]/learn">) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) notFound();
  return <LearnMode words={wordsForCategory(slug)} slug={slug} title={c.ka} back={`/category/${slug}`} />;
}
