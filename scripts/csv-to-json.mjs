// Builds src/data/words.json from the vocabulary CSV files.
//   data/english_120_cards.csv  → Level 1 (IDs 1–120)
//   data/level2_121-240.csv     → Level 2 (IDs 121–240)
// Words are merged by ID, so re-running the import never creates duplicates.
// IDs 1–120 are protected: if a later file tries to change one, the build fails.
// Run: npm run data
import { readFileSync, writeFileSync } from "node:fs";

const SOURCES = [
  { file: "english_120_cards.csv", level: 1 },
  { file: "level2_121-240.csv", level: 2 },
];
const EXPECTED_TOTAL = 240;

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); if (row.some((f) => f.trim())) rows.push(row); }
  return rows;
}

const byId = new Map();
for (const { file, level } of SOURCES) {
  const text = readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8").replace(/^﻿/, "");
  const [header, ...rows] = parseCSV(text);
  for (const r of rows) {
    const o = Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()]));
    const id = Number(o["ID"]);
    if (!Number.isInteger(id) || id < 1) throw new Error(`${file}: invalid ID "${o["ID"]}"`);
    const word = {
      id,
      level: Number(o["Level"]) || level,
      category: o["Category"],
      en: o["English"],
      ka: o["ქართული"],
      sentenceEn: o["English sentence"],
      sentenceKa: o["Sentence ქართული"],
      audioEn: "/" + o["English audio"],
      audioParent: "/" + o["Parent audio"],
      image: "/" + o["Image file"],
    };
    for (const k of ["category", "en", "ka", "sentenceEn", "sentenceKa"])
      if (!word[k]) throw new Error(`${file}: ID ${id} has empty ${k}`);
    const prev = byId.get(id);
    if (prev) {
      const same = JSON.stringify(prev) === JSON.stringify(word);
      if (!same) throw new Error(`${file}: ID ${id} conflicts with an existing entry (${prev.en} vs ${word.en}). Existing IDs must not change.`);
      continue; // identical re-import → skip (no duplicates)
    }
    byId.set(id, word);
  }
}

const words = [...byId.values()].sort((a, b) => a.id - b.id);
if (words.length !== EXPECTED_TOTAL) throw new Error(`Expected ${EXPECTED_TOTAL} words, got ${words.length}`);
words.forEach((w, i) => { if (w.id !== i + 1) throw new Error(`ID gap at position ${i + 1} (found ${w.id})`); });
const cats = new Set(words.map((w) => w.category));
writeFileSync(new URL("../src/data/words.json", import.meta.url), JSON.stringify(words, null, 2) + "\n");
console.log(`words.json: ${words.length} unique words, ${cats.size} categories, levels: ${[...new Set(words.map((w) => w.level))].join(", ")}`);
