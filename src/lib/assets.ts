import list from "@/data/assets.json";
const AVAILABLE = new Set<string>(list as string[]);
export const hasAsset = (path: string) => AVAILABLE.has(path);
