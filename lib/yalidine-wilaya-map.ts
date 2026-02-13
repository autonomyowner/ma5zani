// Map ma5zani wilaya names to Yalidine wilaya names
// Most names match since lib/wilayas.ts uses French names.
// Only notable exception: "Algiers" → "Alger"

import { wilayas } from "./wilayas";

const wilayaNameOverrides: Record<string, string> = {
  Algiers: "Alger",
};

export function toYalidineName(name: string): string {
  return wilayaNameOverrides[name] || name;
}

export function toYalidineId(name: string): number {
  const wilaya = wilayas.find(
    (w) => w.name.toLowerCase() === name.toLowerCase() || w.nameAr === name
  );
  if (!wilaya) return 0;
  return parseInt(wilaya.code, 10);
}

export function getWilayaCode(name: string): string {
  const wilaya = wilayas.find(
    (w) => w.name.toLowerCase() === name.toLowerCase() || w.nameAr === name
  );
  return wilaya?.code || "01";
}
