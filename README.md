# Wordly Kids 🦉

ინტერაქტიული ინგლისური ლექსიკა 6–10 წლის ქართულენოვანი ბავშვებისთვის.
Mobile-first, app-like demo built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS 4**.

## ფუნქციები (MVP)

| | |
|---|---|
| 🏠 **მთავარი დაფა** | მისალმება, ვარსკვლავები, ნასწავლი სიტყვები, დღეები ზედიზედ, „გააგრძელე სწავლა“, 12 თემა პროგრესით |
| 📚 **12 თემა / 120 სიტყვა** | მონაცემები პირდაპირ `data/english_120_cards.csv`-დან |
| 📖 **სწავლის რეჟიმი** | ბარათი PDF-ის სტილში: სიტყვა, ქართული თარგმანი, წინადადება მონიშნული სიტყვით, ქართული წინადადება, ინგლისური გამოთქმა (სიტყვა + წინადადება), მშობლის ჩანაწერის ღილაკი |
| 🃏 **ორმხრივი ბარათები** | 3D გადაბრუნება, მიმართულების გადართვა EN→ქარ / ქარ→EN, ავტომატური გამოთქმა, „ვიცი / ისევ ვივარჯიშებ“, რთული ბარათები ბოლოში მეორდება, swipe |
| 🧩 **ქვიზები** | 4 ტიპის კითხვა (სურათი→EN, EN→ქარ, ქარ→EN, მოსმენა→სურათი), თემის ქვიზი (10) და შერეული ქვიზი (12), ვარსკვლავები, კონფეტი, შეცდომების გამეორება |
| ⭐ **პროგრესი** | LocalStorage-ში: სიტყვის სტატუსი (ახალი / ვსწავლობ / ნასწავლი), ვარსკვლავები, ქვიზის საუკეთესო შედეგები, ჯილდოები, განულება |

## გაშვება

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## მონაცემები და მედია

- **სიტყვები:** შეცვალე `data/english_120_cards.csv` და გაუშვი `npm run data` → განახლდება `src/data/words.json`.
- **სურათები:** ჩააგდე `public/images/001.webp … 120.webp`. სანამ ფაილი არ არსებობს, ჩანს emoji (ფერებისთვის — ფერადი ლაქა).
- **ინგლისური აუდიო:** `public/audio/en/001.mp3 …`. სანამ ფაილი არ არის, გამოიყენება ბრაუზერის ჩაშენებული ინგლისური ხმა (Web Speech API).
- **მშობლის ჩანაწერები:** `public/audio/parents/001.mp3 …`.

`npm run dev` / `npm run build` ავტომატურად აგენერირებს `src/data/assets.json` მანიფესტს, ასე რომ აპი მხოლოდ არსებულ ფაილებს ითხოვს.

## Vercel-ზე გაშვება

1. GitHub-ზე შექმენი ცარიელი რეპოზიტორია `wordly-kids` და ატვირთე კოდი:
   ```bash
   git remote add origin https://github.com/<user>/wordly-kids.git
   git push -u origin main
   ```
2. [vercel.com/new](https://vercel.com/new) → Import → `wordly-kids` → Deploy. დამატებითი პარამეტრები არ სჭირდება (Framework: Next.js).

## სტრუქტურა

```
data/english_120_cards.csv     source vocabulary
scripts/                       csv → json, asset manifest
src/app/                       routes: /, /categories, /category/[slug]{,/learn,/flashcards,/quiz}, /quiz, /progress
src/components/                UI (VocabCard, FlashcardMode, QuizGame, …)
src/lib/                       words, progress (LocalStorage store), audio
src/data/                      categories, emoji fallbacks, generated JSON
```
