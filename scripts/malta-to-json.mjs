// Adult module: Malta Travel English (B1–B2)
//   data/malta_travel_150_B1_B2.csv → src/data/adult/malta.json
// Validates headers and contents; merges by ID (re-running never duplicates).
// Run: npm run data:malta
import { readFileSync, writeFileSync } from "node:fs";

const HEADERS = ["id", "module_id", "category", "category_ka", "cefr_level", "english", "georgian", "english_sentence", "georgian_sentence", "study_priority", "entry_type", "image_path", "word_audio_path", "sentence_audio_path"];

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
const fail = (m) => { throw new Error(`malta import: ${m}`); };
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const text = readFileSync(new URL("../data/malta_travel_150_B1_B2.csv", import.meta.url), "utf8").replace(/^﻿/, "");
const [header, ...rows] = parseCSV(text);
if (JSON.stringify(header.map((h) => h.trim())) !== JSON.stringify(HEADERS)) fail(`unexpected headers: ${header.join(",")}`);

const byId = new Map();
for (const r of rows) {
  const o = Object.fromEntries(HEADERS.map((h, i) => [h, (r[i] ?? "").trim()]));
  if (!/^MT-\d{3}$/.test(o.id)) fail(`bad id ${o.id}`);
  if (o.module_id !== "malta-travel-b1-b2") fail(`${o.id}: module ${o.module_id}`);
  if (!["B1", "B2"].includes(o.cefr_level)) fail(`${o.id}: level ${o.cefr_level}`);
  if (!["Start here", "Practice"].includes(o.study_priority)) fail(`${o.id}: priority ${o.study_priority}`);
  for (const k of ["category", "category_ka", "english", "georgian", "english_sentence", "georgian_sentence"]) if (!o[k]) fail(`${o.id}: empty ${k}`);
  const item = {
    id: o.id,
    cat: slug(o.category),
    level: o.cefr_level,
    en: o.english,
    ka: o.georgian,
    sentenceEn: o.english_sentence,
    sentenceKa: o.georgian_sentence,
    essential: o.study_priority === "Start here",
    type: o.entry_type,
    ...(o.word_audio_path ? { wordAudio: "/" + o.word_audio_path.replace(/^\//, "") } : {}),
    ...(o.sentence_audio_path ? { sentenceAudio: "/" + o.sentence_audio_path.replace(/^\//, "") } : {}),
    ...(o.image_path ? { image: "/" + o.image_path.replace(/^\//, "") } : {}),
  };
  if (byId.has(item.id)) {
    if (JSON.stringify(byId.get(item.id)) !== JSON.stringify(item)) fail(`${item.id} appears twice with different content`);
    continue;
  }
  byId.set(item.id, { item, category: o.category, categoryKa: o.category_ka });
}

const items = [...byId.values()].map((v) => v.item).sort((a, b) => a.id.localeCompare(b.id));
const cats = [];
for (const v of byId.values()) if (!cats.some((c) => c.slug === v.item.cat)) cats.push({ slug: v.item.cat, en: v.category, ka: v.categoryKa });
// checks required by the brief
if (items.length !== 150) fail(`expected 150 items, got ${items.length}`);
if (items.filter((i) => i.level === "B1").length !== 75) fail("expected 75 B1");
if (items.filter((i) => i.level === "B2").length !== 75) fail("expected 75 B2");
if (cats.length !== 15 || cats.some((c) => items.filter((i) => i.cat === c.slug).length !== 10)) fail("expected 15 categories × 10");
if (items.filter((i) => i.essential).length !== 30) fail("expected exactly 30 'Start here'");

writeFileSync(
  new URL("../src/data/adult/malta.json", import.meta.url),
  JSON.stringify({ moduleId: "malta-travel-b1-b2", title: "Malta Travel English", categories: cats, items }, null, 1) + "\n",
);
console.log(`malta.json: ${items.length} items, ${cats.length} categories, essentials ${items.filter((i) => i.essential).length}`);
