import data from "@/data/adult/malta.json";

export type CefrLevel = "B1" | "B2";
export type MaltaItem = {
  id: string; // MT-001 … MT-150 (own namespace, never mixed with kids' numeric IDs)
  cat: string;
  level: CefrLevel;
  en: string;
  ka: string;
  sentenceEn: string;
  sentenceKa: string;
  essential: boolean; // "Start here"
  type: "word" | "phrase";
  wordAudio?: string;
  sentenceAudio?: string;
};
export type MaltaCategory = { slug: string; en: string; ka: string };

export const MODULE_ID = "malta-travel-b1-b2";
export const MALTA_ITEMS = data.items as MaltaItem[];
export const MALTA_CATEGORIES = data.categories as MaltaCategory[];
export const itemById = (id: string) => MALTA_ITEMS.find((i) => i.id === id);
export const categoryBySlug = (slug: string) => MALTA_CATEGORIES.find((c) => c.slug === slug);

/** Practice sets (route param). Category slugs are sets too. */
export const STATIC_SETS = ["essentials", "all", "b1", "b2", "review"] as const;
export const ALL_SETS = [...STATIC_SETS, ...MALTA_CATEGORIES.map((c) => c.slug)];

export function setLabel(set: string): string {
  switch (set) {
    case "essentials":
      return "Travel Essentials 30";
    case "all":
      return "ყველა 150";
    case "b1":
      return "მხოლოდ B1";
    case "b2":
      return "მხოლოდ B2";
    case "review":
      return "სწრაფი გამეორება";
    default:
      return categoryBySlug(set)?.ka ?? set;
  }
}

/** Items of a static set (review is computed from progress, see adult/progress.ts). */
export function staticSetItems(set: string): MaltaItem[] {
  switch (set) {
    case "essentials":
      return MALTA_ITEMS.filter((i) => i.essential);
    case "all":
      return MALTA_ITEMS;
    case "b1":
      return MALTA_ITEMS.filter((i) => i.level === "B1");
    case "b2":
      return MALTA_ITEMS.filter((i) => i.level === "B2");
    default:
      return MALTA_ITEMS.filter((i) => i.cat === set);
  }
}

/** Conversation practice: situations built from the dataset's own example sentences. */
export type Scenario = { slug: string; title: string; setting: string; ids: string[] };
export const SCENARIOS: Scenario[] = [
  { slug: "hotel-check-in", title: "სასტუმროში რეგისტრაცია", setting: "მიღების განყოფილებასთან დგახართ, ახლახან ჩამოხვედით.", ids: ["MT-011", "MT-012", "MT-014", "MT-016", "MT-019"] },
  { slug: "ferry-ticket", title: "ბორნის ბილეთი გოზოზე", setting: "საბორნე ტერმინალის სალაროსთან ხართ.", ids: ["MT-031", "MT-032", "MT-034", "MT-038", "MT-039"] },
  { slug: "directions", title: "გზის კითხვა", setting: "ვალეტას ქუჩაში გამვლელს ეკითხებით გზას.", ids: ["MT-121", "MT-041", "MT-042", "MT-046", "MT-048"] },
  { slug: "ordering-food", title: "საკვების შეკვეთა", setting: "რესტორანში ან კაფეში შედიხართ.", ids: ["MT-051", "MT-053", "MT-061", "MT-068", "MT-055", "MT-060"] },
  { slug: "rescheduling-tour", title: "ტურის გადატანა", setting: "ტურის ოფისს ან ორგანიზატორს ესაუბრებით.", ids: ["MT-106", "MT-087", "MT-086", "MT-107", "MT-110"] },
  { slug: "weather", title: "ამინდის გარკვევა", setting: "სასტუმროს მიღებაზე ან ნავსადგურში ხვალინდელ გეგმებზე საუბრობთ.", ids: ["MT-091", "MT-092", "MT-095", "MT-036", "MT-098"] },
];

/** Splits a sentence so the target word/phrase can be highlighted (case-insensitive). */
export function highlight(sentence: string, phrase: string): { text: string; hit: boolean }[] {
  const i = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (i < 0) return [{ text: sentence, hit: false }];
  return [
    { text: sentence.slice(0, i), hit: false },
    { text: sentence.slice(i, i + phrase.length), hit: true },
    { text: sentence.slice(i + phrase.length), hit: false },
  ].filter((p) => p.text);
}
