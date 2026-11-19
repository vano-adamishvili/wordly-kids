# Wivilo

**ისწავლე. ითამაშე. განვითარდი. · Learn. Play. Grow.**

ინტერაქტიული ინგლისური ლექსიკა 6–10 წლის ქართულენოვანი ბავშვებისთვის — **240 სიტყვა, 24 თემა, 2 დონე**.
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

## ბრენდი და დიზაინ-სისტემა

- **Wivi** — აპის მასკოტი (`src/components/Wivi.tsx`), ორიგინალური SVG პერსონაჟი ყვითელი ფოთლის ბიბინით; ემოციები: `happy`, `excited`, `thinking`, `cheering`, `encouraging`, `sleepy`, `surprised`. ანიმაცია ითვალისწინებს `prefers-reduced-motion`-ს.
- **ლოგო:** `public/brand/` (wivilo-logo.svg/png, wivilo-wordmark.svg, wivilo-mark.svg, wivilo-app-icon.svg, icon-192/512.png, wivilo-og.png); favicon/apple/OG — `src/app/`. React: `src/components/brand/WiviloLogo.tsx`. ხელახლა აწყობა: `bash scripts/brand/build.sh` (wordmark = Fredoka, OFL, ვექტორად).
- **ფერები და შრიფტები:** `src/app/globals.css` (`@theme` ტოკენები: lavender, sun, mint, coral, sky, cream, ink). შრიფტები: Fredoka (ინგლისური სათაურები), Nunito, Noto Sans Georgian.
- **თემების ფერები და ილუსტრაციები:** `src/data/categories.ts`.

## დონე 2 (v1.2)

- **დონეები:** დონე 1 = ID 1–120, დონე 2 = ID 121–240. ორივე ყოველთვის ღიაა; მთავარ გვერდზე დონის გადამრთველი.
- **ვობლის დღის 5 სიტყვა** (`/daily`): ჯერ გასამეორებელი, მერე ახალი სიტყვები; არჩევანი დღეში ერთხელ ინახება.
- **შერეული გამეორება** (`/review`, `/review/all|1|2`): გასამეორებელი სიტყვები პირველ რიგში; ბარათების შედეგი ინახება ცალ-ცალკე მიმართულებისთვის (EN→ქა / ქა→EN).
- **საპირისპიროები** (`/opposites`): Big/Small, Fast/Slow, Hot/Cold, Long/Short, Clean/Dirty.
- **პროგრესი:** შენახვის გასაღები იგივეა (`wordly-kids-progress-v1`); ახალი ველები (`review`, `dirs`, `level`, `dailyPick`, `seenLevel2Intro`) არასავალდებულოა. პირველ ჩატვირთვაზე იქმნება ხელუხლებელი ასლი `wordly-kids-progress-v1-backup-before-level2`. პროგრესის გვერდზე — ჩამოტვირთვა/აღდგენა.

## მონაცემები და მედია

- **სიტყვები:** `data/english_120_cards.csv` (დონე 1) + `data/level2_121-240.csv` (დონე 2) → `npm run data` → `src/data/words.json`. იმპორტი აერთიანებს ID-ით (განმეორებით გაშვება დუბლიკატს არ ქმნის), ID 1–120-ის შეცვლის მცდელობა და 240-ზე ნაკლები/მეტი სიტყვა build-ს აჩერებს.
- **სურათები:** ჩააგდე `public/images/001.webp … 120.webp` — ისინი ავტომატურად ჩაანაცვლებს დროებით ილუსტრაციებს. დროებითი ილუსტრაციები (`public/art/`) არის Fluent Emoji Flat (MIT, Microsoft) + 4 ხელით დახატული SVG; ხელახლა გენერაცია: `npm run art`. ფერების სიტყვებს აქვს ფერადი საღებავის ლაქა.
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

## დომენი: wivilo.ge (+ wivilo.app)

1. Vercel → Project → **Settings → Domains** → დაამატე `wivilo.ge` (Production) და `www.wivilo.ge`.
2. დაამატე `wivilo.app` და აირჩიე **Redirect to `wivilo.ge`** (308).
3. დომენის რეგისტრატორთან ჩაწერე Vercel-ის მიერ ნაჩვენები DNS ჩანაწერები (`A` / `CNAME`). HTTPS Vercel-ში ავტომატურია.
4. Settings → **Environment Variables**: `NEXT_PUBLIC_SITE_URL = https://wivilo.ge` (Production) → Redeploy. ამით canonical და სოციალური გაზიარების ბმულები wivilo.ge-ზე გადავა.
5. **პროგრესის გადატანა:** LocalStorage მისამართზეა მიბმული. ძველ მისამართზე → პროგრესი → „პროგრესის ჩამოტვირთვა“; wivilo.ge-ზე → პროგრესი → „ფაილიდან აღდგენა“. ძველი `*.vercel.app` მისამართი ღია დატოვე, სანამ აღდგენა არ შემოწმდება.

ტექნიკური იდენტიფიკატორები (LocalStorage-ის გასაღები `wordly-kids-progress-v1`, რეპოზიტორიის სახელი) განზრახ არ შეცვლილა, რომ პროგრესი არ დაიკარგოს.
