export function normalizeQuantity(quantity: number, unit: string): { value: number; baseUnit: string } {
  const u = unit.toLowerCase().trim();

  if (u === "kg" || u === "chili" || u === "chilo") return { value: roundQuantity(quantity * 1000), baseUnit: "g" };
  if (u === "g" || u === "gr" || u === "grammi") return { value: roundQuantity(quantity), baseUnit: "g" };

  if (u === "l" || u === "litro" || u === "litri") return { value: roundQuantity(quantity * 1000), baseUnit: "ml" };
  if (u === "ml" || u === "millilitri") return { value: roundQuantity(quantity), baseUnit: "ml" };
  if (u === "cl") return { value: roundQuantity(quantity * 10), baseUnit: "ml" };
  if (u === "dl") return { value: roundQuantity(quantity * 100), baseUnit: "ml" };
  if (u === "cucchiaio" || u === "cucchiai") return { value: roundQuantity(quantity * 15), baseUnit: "ml" };
  if (u === "cucchiaino" || u === "cucchiaini") return { value: roundQuantity(quantity * 5), baseUnit: "ml" };

  return { value: roundQuantity(quantity), baseUnit: u || "pz" };
}

export function formatOutput(value: number, baseUnit: string): string {
  const rounded = roundQuantity(value);
  if (baseUnit === "g" && rounded >= 1000) return `${(rounded / 1000).toFixed(2).replace(/\.?0+$/, "")} kg`;
  if (baseUnit === "ml" && rounded >= 1000) return `${(rounded / 1000).toFixed(2).replace(/\.?0+$/, "")} l`;
  return `${rounded.toFixed(1).replace(/\.0$/, "")} ${baseUnit}`;
}

const PLURAL_RULES: [string, string][] = [
  ["chi", "co"], ["ghi", "go"],
  ["ci", "ca"], ["gi", "ga"],
  ["glia", "glio"], ["glie", "glio"],
  ["i", "o"],
  ["e", "a"],
];

function normalizePlural(word: string): string {
  if (word.length <= 3) return word;
  for (const [plural, singular] of PLURAL_RULES) {
    if (word.endsWith(plural) && word.length > plural.length) {
      return word.slice(0, -plural.length) + singular;
    }
  }
  return word;
}

export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9àèéìòù\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set(["di", "del", "della", "delle", "degli", "d'", "con", "e", "in", "a", "al", "allo", "alla", "alle", "agli", "il", "lo", "la", "le", "gli", "senza"]);

function getTokens(name: string): string[] {
  return normalizeIngredientName(name)
    .split(/\s+/)
    .filter(t => t.length > 0 && !STOP_WORDS.has(t))
    .map(t => normalizePlural(t));
}

const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  "olio": ["olio d'oliva", "olio extravergine", "olio evo", "olio di oliva"],
  "olio evo": ["olio", "olio d'oliva", "olio extravergine"],
  "burro": ["margarina"],
  "parmigiano": ["parmigiano reggiano", "grana", "grana padano", "formaggio grana"],
  "grana padano": ["parmigiano", "parmigiano reggiano", "formaggio grana"],
  "mozzarella": ["fior di latte", "bocconcini"],
  "pomodoro": ["passata", "passata di pomodoro", "pomodori pelati", "polpa di pomodoro"],
  "passata": ["pomodoro", "passata di pomodoro", "pomodori pelati"],
  "vino bianco": ["vino bianco secco"],
  "vino rosso": ["vino rosso secco"],
  "scorza di limone": ["limone", "buccia di limone", "scorza grattugiata di limone"],
  "succo di limone": ["limone"],
  "pangrattato": ["pane grattugiato", "pangrattato"],
};

export function isIngredientMatch(aName: string, bName: string): boolean {
  const a = normalizeIngredientName(aName);
  const b = normalizeIngredientName(bName);
  if (a === b) return true;
  if (a.length > 2 && b.length > 2 && (a.includes(b) || b.includes(a))) return true;

  const aTokens = getTokens(aName);
  const bTokens = getTokens(bName);
  const significantA = aTokens.filter(t => t.length > 2);
  const significantB = bTokens.filter(t => t.length > 2);

  const match = significantA.some(t => significantB.includes(t));
  if (match) return true;

  const aNorm = aTokens.join(" ");
  const bNorm = bTokens.join(" ");
  for (const [canonical, variants] of Object.entries(INGREDIENT_SYNONYMS)) {
    const c = normalizeIngredientName(canonical);
    const v = variants.map(v => normalizeIngredientName(v));
    const all = [c, ...v];
    const inA = all.some(s => aNorm.includes(s) || s.includes(aNorm));
    const inB = all.some(s => bNorm.includes(s) || s.includes(bNorm));
    if (inA && inB) return true;
  }

  return false;
}

export function sanitizeIngredientName(name: string): string {
  return normalizeIngredientName(name).replace(/\s+/g, "");
}

export function roundQuantity(value: number): number {
  if (Number.isInteger(value)) return value;
  return Math.round(value * 100) / 100;
}

export function compareQuantities(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001;
}
