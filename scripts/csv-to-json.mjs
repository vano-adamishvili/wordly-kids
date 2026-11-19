// Converts data/english_120_cards.csv -> src/data/words.json
// Run: npm run data
import { readFileSync, writeFileSync } from "node:fs";

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

const text = readFileSync(new URL("../data/english_120_cards.csv", import.meta.url), "utf8").replace(/^﻿/, "");
const [header, ...rows] = parseCSV(text);
const words = rows.map((r) => {
  const o = Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()]));
  return {
    id: Number(o["ID"]),
    category: o["Category"],
    en: o["English"],
    ka: o["ქართული"],
    sentenceEn: o["English sentence"],
    sentenceKa: o["Sentence ქართული"],
    audioEn: "/" + o["English audio"],
    audioParent: "/" + o["Parent audio"],
    image: "/" + o["Image file"],
  };
});
writeFileSync(new URL("../src/data/words.json", import.meta.url), JSON.stringify(words, null, 2));
console.log(`Wrote ${words.length} words, categories:`, [...new Set(words.map((w) => w.category))].length);
