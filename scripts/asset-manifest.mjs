// Lists which images / audio files actually exist in public/, so the app
// only requests real files. Runs automatically before `dev` and `build`.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
const pub = new URL("../public/", import.meta.url);
const list = (dir) => {
  const p = new URL(dir, pub);
  return existsSync(p) ? readdirSync(p).filter((f) => !f.startsWith(".")).map((f) => `/${dir}${f}`) : [];
};
const assets = [...list("images/"), ...list("audio/en/"), ...list("audio/parents/")];
writeFileSync(new URL("../src/data/assets.json", import.meta.url), JSON.stringify(assets, null, 2) + "\n");
console.log(`asset manifest: ${assets.length} files`);
