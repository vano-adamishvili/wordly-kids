import { notFound } from "next/navigation";
import { CATEGORIES, categoryBySlug } from "@/data/categories";
import QuizGame from "@/components/QuizGame";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryQuizPage({ params }: PageProps<"/category/[slug]/quiz">) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) notFound();
  return <QuizGame quizKey={slug} slug={slug} title={c.ka} back={`/category/${slug}`} />;
}
