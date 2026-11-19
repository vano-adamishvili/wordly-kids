import { notFound } from "next/navigation";
import { CATEGORIES, categoryBySlug } from "@/data/categories";
import LearnMode from "@/components/LearnMode";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function LearnPage({ params }: PageProps<"/category/[slug]/learn">) {
  const { slug } = await params;
  if (!categoryBySlug(slug)) notFound();
  return <LearnMode slug={slug} />;
}
