import { notFound } from "next/navigation";
import { CATEGORIES, categoryBySlug } from "@/data/categories";
import CategoryView from "@/components/CategoryView";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  return { title: c ? `${c.ka} · Wordly Kids` : "Wordly Kids" };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  if (!categoryBySlug(slug)) notFound();
  return <CategoryView slug={slug} />;
}
