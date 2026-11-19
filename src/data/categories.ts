export type Category = {
  slug: string;
  name: string; // English name as in the CSV (used to match words)
  ka: string; // Georgian title
  /** accent colour, soft tint background, deep tone for text on tint */
  accent: string;
  soft: string;
  deep: string;
  /** illustrations from public/art/ui/: [main, small, small] */
  art: [string, string, string];
};

export const CATEGORIES: Category[] = [
  { slug: "colors", name: "Colors", ka: "ფერები", accent: "#FF8D85", soft: "#FFEDEB", deep: "#B8443C", art: ["rainbow", "artist-palette", "sparkles"] },
  { slug: "food-drinks", name: "Food & Drinks", ka: "საკვები და სასმელი", accent: "#FFB547", soft: "#FFF3DE", deep: "#9A5E00", art: ["red-apple", "banana", "strawberry"] },
  { slug: "animals", name: "Animals", ka: "ცხოველები", accent: "#5FCFA4", soft: "#E3F7EF", deep: "#1F7A58", art: ["dog-face", "rabbit-face", "lion"] },
  { slug: "school", name: "School", ka: "სკოლა", accent: "#80C7F4", soft: "#E6F4FD", deep: "#1F6C9E", art: ["backpack", "pencil", "open-book"] },
  { slug: "family", name: "Family", ka: "ოჯახი", accent: "#F78FB3", soft: "#FDEBF2", deep: "#A8336A", art: ["people-hugging", "red-heart", "house-with-garden"] },
  { slug: "body", name: "Body", ka: "სხეული", accent: "#FFA36C", soft: "#FFEFE4", deep: "#A6501A", art: ["raised-hand", "eye", "ear"] },
  { slug: "clothes", name: "Clothes", ka: "ტანსაცმელი", accent: "#8B9CF4", soft: "#ECEFFE", deep: "#3D4DB0", art: ["t-shirt", "dress", "billed-cap"] },
  { slug: "weather-nature", name: "Weather & Nature", ka: "ამინდი და ბუნება", accent: "#4FC3D6", soft: "#E1F5F8", deep: "#16707F", art: ["sun-behind-cloud", "deciduous-tree", "cherry-blossom"] },
  { slug: "actions", name: "Actions", ka: "მოქმედებები", accent: "#B58CF0", soft: "#F2EBFD", deep: "#6A3FB0", art: ["person-running", "soccer-ball", "musical-notes"] },
  { slug: "home", name: "Home", ka: "სახლი", accent: "#F2BE3A", soft: "#FFF6D9", deep: "#8A6400", art: ["house", "couch-and-lamp", "bed"] },
  { slug: "feelings", name: "Feelings", ka: "გრძნობები", accent: "#FF7EA8", soft: "#FFE9F0", deep: "#B02E5B", art: ["grinning-face-with-big-eyes", "star-struck", "smiling-face-with-hearts"] },
  { slug: "toys-transport", name: "Toys & Transport", ka: "სათამაშოები და ტრანსპორტი", accent: "#5BAEEB", soft: "#E4F1FC", deep: "#195E94", art: ["bicycle", "kite", "airplane"] },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByName = (name: string) => CATEGORIES.find((c) => c.name === name);

/** CSS custom properties for a category, to be spread into `style`. */
export function categoryVars(c: Category): React.CSSProperties {
  return { "--accent": c.accent, "--soft": c.soft, "--deep": c.deep } as React.CSSProperties;
}
