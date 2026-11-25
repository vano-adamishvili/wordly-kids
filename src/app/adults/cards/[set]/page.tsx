import { notFound } from "next/navigation";
import AdultCards from "@/components/adult/AdultCards";
import { ALL_SETS, setLabel } from "@/lib/adult/malta";

export function generateStaticParams() {
  return ALL_SETS.map((set) => ({ set }));
}

export async function generateMetadata({ params }: PageProps<"/adults/cards/[set]">) {
  const { set } = await params;
  return { title: `${setLabel(set)} · Malta Travel English · Wivilo` };
}

export default async function Page({ params }: PageProps<"/adults/cards/[set]">) {
  const { set } = await params;
  if (!ALL_SETS.includes(set)) notFound();
  return <AdultCards set={set} />;
}
