// Builds placeholder vocabulary illustrations into public/art/.
// Source: Fluent Emoji Flat (MIT, Microsoft) via @iconify-json/fluent-emoji-flat,
// plus a few custom SVGs in scripts/custom-art/. Real illustrations placed in
// public/images/NNN.webp always take priority over these (see WordArt.tsx).
// Run: npm run art
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
const require = createRequire(import.meta.url);
const set = require("@iconify-json/fluent-emoji-flat/icons.json");

const WORD_ART = {
  11: "red-apple", 12: "banana", 13: "bread", 14: "glass-of-milk", 15: "cheese-wedge", 16: "egg", 17: "droplet", 18: "carrot", 19: "cooked-rice", 20: "beverage-box",
  21: "dog-face", 22: "cat-face", 23: "bird", 24: "fish", 25: "rabbit-face", 26: "horse-face", 27: "lion", 28: "elephant", 29: "monkey-face", 30: "turtle",
  31: "open-book", 32: "pencil", 33: "pen", 34: "backpack", 35: "custom:desk", 36: "chair", 37: "straight-ruler", 38: "custom:eraser", 39: "teacher", 40: "school",
  41: "woman", 42: "man", 43: "girl", 44: "boy", 45: "old-woman", 46: "old-man", 47: "baby", 48: "people-hugging", 49: "handshake", 50: "child",
  51: "smiling-face-with-smiling-eyes", 52: "person-curly-hair", 53: "eye", 54: "ear", 55: "nose", 56: "mouth", 57: "raised-hand", 58: "flexed-biceps", 59: "leg", 60: "foot",
  61: "custom:shirt", 62: "t-shirt", 63: "dress", 64: "custom:skirt", 65: "jeans", 66: "running-shoe", 67: "socks", 68: "billed-cap", 69: "coat", 70: "hiking-boot",
  71: "sun", 72: "cloud-with-rain", 73: "snowflake", 74: "cloud", 75: "wind-face", 76: "deciduous-tree", 77: "cherry-blossom", 78: "crescent-moon", 79: "star", 80: "rainbow",
  81: "person-running", 82: "person-cartwheeling", 83: "person-walking", 84: "person-swimming", 85: "books", 86: "writing-hand", 87: "artist-palette", 88: "microphone", 89: "woman-dancing", 90: "sleeping-face",
  91: "house", 92: "framed-picture", 93: "cooking", 94: "person-in-bed", 95: "bathtub", 96: "door", 97: "window", 98: "bed", 99: "fork-and-knife-with-plate", 100: "couch-and-lamp",
  101: "grinning-face-with-big-eyes", 102: "crying-face", 103: "angry-face", 104: "tired-face", 105: "face-savoring-food", 106: "cup-with-straw", 107: "fearful-face", 108: "star-struck", 109: "yawning-face", 110: "astonished-face",
  111: "soccer-ball", 112: "nesting-dolls", 113: "teddy-bear", 114: "kite", 115: "bicycle", 116: "automobile", 117: "bus", 118: "locomotive", 119: "airplane", 120: "sailboat",
};

// UI illustrations (category worlds, badges, decorations)
const UI_ART = [
  "rainbow", "artist-palette", "red-apple", "banana", "strawberry", "dog-face", "lion", "rabbit-face", "backpack", "pencil", "open-book",
  "house-with-garden", "people-hugging", "red-heart", "raised-hand", "eye", "ear", "t-shirt", "dress", "billed-cap", "sun-behind-cloud", "sun", "cloud",
  "person-running", "soccer-ball", "musical-notes", "house", "couch-and-lamp", "bed", "grinning-face-with-big-eyes", "star-struck", "smiling-face-with-hearts",
  "bicycle", "kite", "airplane", "teddy-bear", "glowing-star", "star", "sparkles", "fire", "trophy", "seedling", "hatching-chick", "rocket", "crown",
  "sports-medal", "1st-place-medal", "books", "speaker-high-volume", "bullseye", "deciduous-tree", "carrot", "cherry-blossom",
];

function svgFor(name) {
  if (name.startsWith("custom:")) {
    const p = new URL(`./custom-art/${name.slice(7)}.svg`, import.meta.url);
    return readFileSync(p, "utf8");
  }
  const real = set.icons[name] ? name : set.aliases?.[name]?.parent;
  const icon = set.icons[real];
  if (!icon) throw new Error(`Missing icon: ${name}`);
  const w = icon.width ?? set.width ?? 32, h = icon.height ?? set.height ?? 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${icon.body}</svg>\n`;
}

const out = new URL("../public/art/", import.meta.url);
mkdirSync(new URL("words/", out), { recursive: true });
mkdirSync(new URL("ui/", out), { recursive: true });
let n = 0;
for (const [id, name] of Object.entries(WORD_ART)) {
  writeFileSync(new URL(`words/${String(id).padStart(3, "0")}.svg`, out), svgFor(name));
  n++;
}
for (const name of UI_ART) writeFileSync(new URL(`ui/${name}.svg`, out), svgFor(name));
console.log(`art: ${n} word illustrations, ${UI_ART.length} ui illustrations`);
if (!existsSync(new URL("../public/art/README.txt", import.meta.url)))
  writeFileSync(new URL("README.txt", out), "Placeholder illustrations: Fluent Emoji Flat (MIT License, Microsoft Corporation) + custom SVGs.\nFinal artwork goes to public/images/NNN.webp and overrides these automatically.\n");
