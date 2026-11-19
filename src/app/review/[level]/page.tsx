import { notFound } from "next/navigation";
import { ReviewSession, type ReviewScope } from "@/components/MixedReview";

const SCOPES: ReviewScope[] = ["all", "1", "2"];

export function generateStaticParams() {
  return SCOPES.map((level) => ({ level }));
}

export default async function ReviewSessionPage({ params }: PageProps<"/review/[level]">) {
  const { level } = await params;
  if (!SCOPES.includes(level as ReviewScope)) notFound();
  return <ReviewSession scope={level as ReviewScope} />;
}
