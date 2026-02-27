/**
 * Utility per la gestione e normalizzazione degli ingredienti
 */

export function normalizeQuantity(quantity: number, unit: string): { value: number; baseUnit: string } {
  const u = unit.toLowerCase().trim();
  
  // Massa -> Grammi
  if (u === "kg" || u === "chili" || u === "chilo") return { value: quantity * 1000, baseUnit: "g" };
  if (u === "g" || u === "gr" || u === "grammi") return { value: quantity, baseUnit: "g" };
  
  // Volume -> Millilitri (Inclusi cucchiai e cucchiaini come standard culinari)
  if (u === "l" || u === "litro" || u === "litri") return { value: quantity * 1000, baseUnit: "ml" };
  if (u === "ml" || u === "millilitri") return { value: quantity, baseUnit: "ml" };
  if (u === "cl") return { value: quantity * 10, baseUnit: "ml" };
  if (u === "dl") return { value: quantity * 100, baseUnit: "ml" };
  if (u === "cucchiaio" || u === "cucchiai") return { value: quantity * 15, baseUnit: "ml" };
  if (u === "cucchiaino" || u === "cucchiaini") return { value: quantity * 5, baseUnit: "ml" };

  // Default (pz, fette, uova, etc)
  return { value: quantity, baseUnit: u || "pz" };
}

export function formatOutput(value: number, baseUnit: string): string {
  if (baseUnit === "g" && value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.00$/, "")} kg`;
  if (baseUnit === "ml" && value >= 1000) return `${(value / 1000).toFixed(2).replace(/\.00$/, "")} l`;
  return `${value.toFixed(1).replace(/\.0$/, "")} ${baseUnit}`;
}

/**
 * Pulisce il nome dell'ingrediente per un matching più robusto
 */
export function sanitizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*\)/g, "") // Rimuove parentesi e contenuto
    .replace(/[^a-z0-9]/g, "") // Rimuove tutto ciò che non è alfanumerico
    .trim();
}
