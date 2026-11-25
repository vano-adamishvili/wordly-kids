import type { Metadata } from "next";
import { AdultNav } from "@/components/adult/ui";

export const metadata: Metadata = {
  title: "Malta Travel English · Wivilo",
  description: "Wivilo მოზრდილებისთვის: მოგზაურობის ინგლისური მალტისთვის (B1–B2) — 150 სიტყვა და ფრაზა, ბარათები, ქვიზი, მოსმენა და სასაუბრო პრაქტიკა.",
};

export default function AdultsLayout({ children }: LayoutProps<"/adults">) {
  return (
    <>
      {children}
      <AdultNav />
    </>
  );
}
