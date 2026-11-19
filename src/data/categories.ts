export type Level = 1 | 2;

export type Category = {
  /** stable route id – never change once published */
  slug: string;
  level: Level;
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
  { slug: "colors", level: 1, name: "Colors", ka: "ფერები", accent: "#FF8D85", soft: "#FFEDEB", deep: "#B8443C", art: ["rainbow", "artist-palette", "sparkles"] },
  { slug: "food-drinks", level: 1, name: "Food & Drinks", ka: "საკვები და სასმელი", accent: "#FFB547", soft: "#FFF3DE", deep: "#9A5E00", art: ["red-apple", "banana", "strawberry"] },
  { slug: "animals", level: 1, name: "Animals", ka: "ცხოველები", accent: "#5FCFA4", soft: "#E3F7EF", deep: "#1F7A58", art: ["dog-face", "rabbit-face", "lion"] },
  { slug: "school", level: 1, name: "School", ka: "სკოლა", accent: "#80C7F4", soft: "#E6F4FD", deep: "#1F6C9E", art: ["backpack", "pencil", "open-book"] },
  { slug: "family", level: 1, name: "Family", ka: "ოჯახი", accent: "#F78FB3", soft: "#FDEBF2", deep: "#A8336A", art: ["people-hugging", "red-heart", "house-with-garden"] },
  { slug: "body", level: 1, name: "Body", ka: "სხეული", accent: "#FFA36C", soft: "#FFEFE4", deep: "#A6501A", art: ["raised-hand", "eye", "ear"] },
  { slug: "clothes", level: 1, name: "Clothes", ka: "ტანსაცმელი", accent: "#8B9CF4", soft: "#ECEFFE", deep: "#3D4DB0", art: ["t-shirt", "dress", "billed-cap"] },
  { slug: "weather-nature", level: 1, name: "Weather & Nature", ka: "ამინდი და ბუნება", accent: "#4FC3D6", soft: "#E1F5F8", deep: "#16707F", art: ["sun-behind-cloud", "deciduous-tree", "cherry-blossom"] },
  { slug: "actions", level: 1, name: "Actions", ka: "მოქმედებები", accent: "#B58CF0", soft: "#F2EBFD", deep: "#6A3FB0", art: ["person-running", "soccer-ball", "musical-notes"] },
  { slug: "home", level: 1, name: "Home", ka: "სახლი", accent: "#F2BE3A", soft: "#FFF6D9", deep: "#8A6400", art: ["house", "couch-and-lamp", "bed"] },
  { slug: "feelings", level: 1, name: "Feelings", ka: "გრძნობები", accent: "#FF7EA8", soft: "#FFE9F0", deep: "#B02E5B", art: ["grinning-face-with-big-eyes", "star-struck", "smiling-face-with-hearts"] },
  { slug: "toys-transport", level: 1, name: "Toys & Transport", ka: "სათამაშოები და ტრანსპორტი", accent: "#5BAEEB", soft: "#E4F1FC", deep: "#195E94", art: ["bicycle", "kite", "airplane"] },

  // ── Level 2 (IDs 121–240) ──
  { slug: "fruits-vegetables", level: 2, name: "Fruits & Vegetables", ka: "ხილი და ბოსტნეული", accent: "#7BCB5C", soft: "#EBF7E4", deep: "#3B7A22", art: ["watermelon", "grapes", "carrot"] },
  { slug: "wild-farm-animals", level: 2, name: "Wild & Farm Animals", ka: "გარეული და შინაური ცხოველები", accent: "#F2A33A", soft: "#FFF1DD", deep: "#8F5300", art: ["tiger-face", "cow-face", "duck"] },
  { slug: "places-in-town", level: 2, name: "Places in Town", ka: "ადგილები ქალაქში", accent: "#7FA7E8", soft: "#E8F0FC", deep: "#2F5BA3", art: ["classical-building", "hospital", "convenience-store"] },
  { slug: "transport-travel", level: 2, name: "Transport & Travel", ka: "ტრანსპორტი და მოგზაურობა", accent: "#4FB8C9", soft: "#E0F4F7", deep: "#146A78", art: ["luggage", "taxi", "world-map"] },
  { slug: "daily-activities", level: 2, name: "Daily Activities", ka: "ყოველდღიური საქმეები", accent: "#FFA36C", soft: "#FFEFE4", deep: "#A6501A", art: ["alarm-clock", "toothbrush", "sun-with-face"] },
  { slug: "sports-hobbies", level: 2, name: "Sports & Hobbies", ka: "სპორტი და ჰობი", accent: "#5FCFA4", soft: "#E3F7EF", deep: "#1F7A58", art: ["basketball", "goal-net", "paintbrush"] },
  { slug: "opposites", level: 2, name: "Opposites & Descriptions", ka: "საპირისპიროები და აღწერა", accent: "#B58CF0", soft: "#F2EBFD", deep: "#6A3FB0", art: ["whale", "mouse-face", "snail"] },
  { slug: "weather-seasons", level: 2, name: "Weather & Seasons", ka: "ამინდი და სეზონები", accent: "#6FC3E8", soft: "#E3F3FB", deep: "#1C6C91", art: ["snowman", "maple-leaf", "sun-with-face"] },
  { slug: "jobs-helpers", level: 2, name: "Jobs & Helpers", ka: "პროფესიები", accent: "#FF8D85", soft: "#FFEDEB", deep: "#B8443C", art: ["firefighter", "health-worker", "cook"] },
  { slug: "home-objects", level: 2, name: "Home Objects", ka: "ნივთები სახლში", accent: "#F2BE3A", soft: "#FFF6D9", deep: "#8A6400", art: ["mantelpiece-clock", "light-bulb", "mirror"] },
  { slug: "feelings-personality", level: 2, name: "Feelings & Personality", ka: "გრძნობები და ხასიათი", accent: "#FF7EA8", soft: "#FFE9F0", deep: "#B02E5B", art: ["hugging-face", "smiling-face-with-halo", "person-superhero"] },
  { slug: "nature-space", level: 2, name: "Nature & Space", ka: "ბუნება და კოსმოსი", accent: "#8B9CF4", soft: "#ECEFFE", deep: "#3D4DB0", art: ["ringed-planet", "astronaut", "snow-capped-mountain"] },
];

export const LEVELS: { level: Level; ka: string; sub: string }[] = [
  { level: 1, ka: "დონე 1", sub: "პირველი 120 სიტყვა" },
  { level: 2, ka: "დონე 2", sub: "ახალი 120 სიტყვა" },
];

export const categoriesForLevel = (level: Level) => CATEGORIES.filter((c) => c.level === level);

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByName = (name: string) => CATEGORIES.find((c) => c.name === name);

/** CSS custom properties for a category, to be spread into `style`. */
export function categoryVars(c: Category): React.CSSProperties {
  return { "--accent": c.accent, "--soft": c.soft, "--deep": c.deep } as React.CSSProperties;
}
