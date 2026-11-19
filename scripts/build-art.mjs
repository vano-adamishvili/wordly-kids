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
  // ── Level 2 ──
  121: "pear", 122: "peach", 123: "grapes", 124: "lemon", 125: "strawberry", 126: "watermelon", 127: "potato", 128: "tomato", 129: "cucumber", 130: "ear-of-corn",
  131: "tiger-face", 132: "bear", 133: "giraffe", 134: "zebra", 135: "snake", 136: "crocodile", 137: "frog", 138: "duck", 139: "ewe", 140: "cow-face",
  141: "fountain", 142: "convenience-store", 143: "hospital", 144: "books", 145: "classical-building", 146: "clapper-board", 147: "playground-slide", 148: "motorway", 149: "bridge-at-night", 150: "paw-prints",
  151: "taxi", 152: "bicycle", 153: "delivery-truck", 154: "passenger-ship", 155: "helicopter", 156: "ticket", 157: "luggage", 158: "airplane-departure", 159: "hotel", 160: "world-map",
  161: "alarm-clock", 162: "soap", 163: "toothbrush", 164: "bowl-with-spoon", 165: "hot-beverage", 166: "flying-disc", 167: "unlocked", 168: "locked", 169: "headphone", 170: "open-hands",
  171: "goal-net", 172: "basketball", 173: "tennis", 174: "volleyball", 175: "ice-skate", 176: "person-biking", 177: "paintbrush", 178: "musical-notes", 179: "puzzle-piece", 180: "camping",
  181: "whale", 182: "mouse-face", 183: "racing-car", 184: "snail", 185: "fire", 186: "ice", 187: "scarf", 188: "crayon", 189: "sparkles", 190: "pig-face",
  191: "sun-with-face", 192: "umbrella-with-rain-drops", 193: "sun-behind-large-cloud", 194: "leaf-fluttering-in-wind", 195: "snowman", 196: "tulip", 197: "soft-ice-cream", 198: "maple-leaf", 199: "snowman-without-snow", 200: "cloud-with-lightning-and-rain",
  201: "health-worker", 202: "woman-health-worker", 203: "farmer", 204: "oncoming-bus", 205: "pilot", 206: "cook", 207: "tooth", 208: "firefighter", 209: "artist", 210: "singer",
  211: "light-bulb", 212: "mirror", 213: "custom:pillow", 214: "custom:blanket", 215: "custom:carpet", 216: "custom:curtain", 217: "custom:fridge", 218: "custom:oven", 219: "mantelpiece-clock", 220: "custom:shelf",
  221: "smiling-face-with-halo", 222: "clown-face", 223: "person-superhero", 224: "flushed-face", 225: "relieved-face", 226: "smiling-face-with-sunglasses", 227: "unamused-face", 228: "worried-face", 229: "hugging-face", 230: "fox",
  231: "snow-capped-mountain", 232: "national-park", 233: "canoe", 234: "water-wave", 235: "evergreen-tree", 236: "beach-with-umbrella", 237: "desert-island", 238: "ringed-planet", 239: "rocket", 240: "astronaut",
};

// UI illustrations (category worlds, badges, decorations)
const UI_ART = [
  "rainbow", "artist-palette", "red-apple", "banana", "strawberry", "dog-face", "lion", "rabbit-face", "backpack", "pencil", "open-book",
  "house-with-garden", "people-hugging", "red-heart", "raised-hand", "eye", "ear", "t-shirt", "dress", "billed-cap", "sun-behind-cloud", "sun", "cloud",
  "person-running", "soccer-ball", "musical-notes", "house", "couch-and-lamp", "bed", "grinning-face-with-big-eyes", "star-struck", "smiling-face-with-hearts",
  "bicycle", "kite", "airplane", "teddy-bear", "glowing-star", "star", "sparkles", "fire", "trophy", "seedling", "hatching-chick", "rocket", "crown",
  "sports-medal", "1st-place-medal", "books", "speaker-high-volume", "bullseye", "deciduous-tree", "carrot", "cherry-blossom",
  // Level 2 worlds & features
  "watermelon", "grapes", "tiger-face", "cow-face", "duck", "classical-building", "hospital", "convenience-store", "taxi", "luggage",
  "world-map", "alarm-clock", "toothbrush", "goal-net", "basketball", "whale", "snail", "mouse-face", "sun-with-face", "snowman",
  "maple-leaf", "health-worker", "firefighter", "cook", "mantelpiece-clock", "light-bulb", "mirror", "smiling-face-with-halo",
  "person-superhero", "hugging-face", "ringed-planet", "astronaut", "snow-capped-mountain", "calendar", "card-index-dividers",
  "joystick", "magic-wand", "light-bulb", "paintbrush",
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
for (const name of new Set(UI_ART)) writeFileSync(new URL(`ui/${name}.svg`, out), svgFor(name));
writeFileSync(new URL("../src/data/art-keys.json", import.meta.url), JSON.stringify(WORD_ART) + "\n");
console.log(`art: ${n} word illustrations, ${UI_ART.length} ui illustrations`);
if (!existsSync(new URL("../public/art/README.txt", import.meta.url)))
  writeFileSync(new URL("README.txt", out), "Placeholder illustrations: Fluent Emoji Flat (MIT License, Microsoft Corporation) + custom SVGs.\nFinal artwork goes to public/images/NNN.webp and overrides these automatically.\n");
