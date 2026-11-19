export type Category = {
  slug: string;
  name: string; // English name as in the CSV
  ka: string; // Georgian title
  emoji: string;
  /** Tailwind gradient + accent classes */
  bg: string;
  ring: string;
  bar: string;
};

export const CATEGORIES: Category[] = [
  { slug: "colors", name: "Colors", ka: "ფერები", emoji: "🎨", bg: "from-rose-100 to-orange-100", ring: "ring-rose-300", bar: "bg-rose-400" },
  { slug: "food-drinks", name: "Food & Drinks", ka: "საკვები და სასმელი", emoji: "🍎", bg: "from-amber-100 to-yellow-100", ring: "ring-amber-300", bar: "bg-amber-400" },
  { slug: "animals", name: "Animals", ka: "ცხოველები", emoji: "🐶", bg: "from-lime-100 to-green-100", ring: "ring-lime-300", bar: "bg-lime-500" },
  { slug: "school", name: "School", ka: "სკოლა", emoji: "🎒", bg: "from-sky-100 to-cyan-100", ring: "ring-sky-300", bar: "bg-sky-400" },
  { slug: "family", name: "Family", ka: "ოჯახი", emoji: "👨‍👩‍👧", bg: "from-pink-100 to-fuchsia-100", ring: "ring-pink-300", bar: "bg-pink-400" },
  { slug: "body", name: "Body", ka: "სხეული", emoji: "🖐️", bg: "from-orange-100 to-amber-100", ring: "ring-orange-300", bar: "bg-orange-400" },
  { slug: "clothes", name: "Clothes", ka: "ტანსაცმელი", emoji: "👕", bg: "from-indigo-100 to-blue-100", ring: "ring-indigo-300", bar: "bg-indigo-400" },
  { slug: "weather-nature", name: "Weather & Nature", ka: "ამინდი და ბუნება", emoji: "🌈", bg: "from-teal-100 to-emerald-100", ring: "ring-teal-300", bar: "bg-teal-400" },
  { slug: "actions", name: "Actions", ka: "მოქმედებები", emoji: "🏃", bg: "from-violet-100 to-purple-100", ring: "ring-violet-300", bar: "bg-violet-400" },
  { slug: "home", name: "Home", ka: "სახლი", emoji: "🏠", bg: "from-yellow-100 to-lime-100", ring: "ring-yellow-300", bar: "bg-yellow-400" },
  { slug: "feelings", name: "Feelings", ka: "გრძნობები", emoji: "😊", bg: "from-fuchsia-100 to-pink-100", ring: "ring-fuchsia-300", bar: "bg-fuchsia-400" },
  { slug: "toys-transport", name: "Toys & Transport", ka: "სათამაშოები და ტრანსპორტი", emoji: "🚲", bg: "from-cyan-100 to-sky-100", ring: "ring-cyan-300", bar: "bg-cyan-400" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByName = (name: string) => CATEGORIES.find((c) => c.name === name);
