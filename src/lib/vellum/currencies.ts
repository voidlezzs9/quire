/**
 * Active ISO 4217 names, codes, and signs.
 * A name or code beside a number becomes its sign. A few unmistakable
 * names (yen, euro, rupee, …) become the sign even on their own.
 * Codes that are also ordinary words (try, all, cup, …) only convert in capitals.
 */

export type Currency = {
  code: string;
  symbol: string;
  names: readonly string[];
};

export const CURRENCIES: readonly Currency[] = [
  { code: "AED", symbol: "د.إ", names: ["dirham", "dirhams"] },
  { code: "AFN", symbol: "؋", names: ["afghani", "afghanis"] },
  { code: "ALL", symbol: "Lek", names: ["lek", "leke"] },
  { code: "AMD", symbol: "֏", names: ["dram", "drams"] },
  { code: "ANG", symbol: "ƒ", names: ["guilder", "guilders"] },
  { code: "AOA", symbol: "Kz", names: ["kwanza"] },
  { code: "ARS", symbol: "$", names: ["peso", "pesos"] },
  { code: "AUD", symbol: "$", names: [] },
  { code: "AWG", symbol: "ƒ", names: ["florin"] },
  { code: "AZN", symbol: "₼", names: ["manat", "manats"] },
  { code: "BAM", symbol: "KM", names: ["mark", "marks"] },
  { code: "BBD", symbol: "$", names: [] },
  { code: "BDT", symbol: "৳", names: ["taka"] },
  { code: "BGN", symbol: "лв", names: ["lev", "leva"] },
  { code: "BHD", symbol: "BD", names: ["dinar", "dinars"] },
  { code: "BIF", symbol: "Fr", names: ["franc", "francs"] },
  { code: "BMD", symbol: "$", names: [] },
  { code: "BND", symbol: "$", names: [] },
  { code: "BOB", symbol: "Bs", names: ["boliviano", "bolivianos"] },
  { code: "BRL", symbol: "R$", names: ["real", "reais"] },
  { code: "BSD", symbol: "$", names: [] },
  { code: "BTN", symbol: "Nu", names: ["ngultrum"] },
  { code: "BWP", symbol: "BWP", names: ["pula"] },
  { code: "BYN", symbol: "Br", names: [] },
  { code: "BZD", symbol: "$", names: [] },
  { code: "CAD", symbol: "$", names: [] },
  { code: "CDF", symbol: "Fr", names: [] },
  { code: "CHF", symbol: "Fr", names: [] },
  { code: "CLP", symbol: "$", names: [] },
  { code: "CNY", symbol: "元", names: ["yuan", "renminbi"] },
  { code: "COP", symbol: "$", names: [] },
  { code: "CRC", symbol: "₡", names: ["colon", "colones"] },
  { code: "CUP", symbol: "$", names: [] },
  { code: "CVE", symbol: "$", names: ["escudo", "escudos"] },
  { code: "CZK", symbol: "Kč", names: ["koruna"] },
  { code: "DJF", symbol: "Fr", names: [] },
  { code: "DKK", symbol: "kr", names: ["krone", "kroner"] },
  { code: "DOP", symbol: "$", names: [] },
  { code: "DZD", symbol: "DA", names: [] },
  { code: "EGP", symbol: "E£", names: [] },
  { code: "ERN", symbol: "Nfk", names: ["nakfa"] },
  { code: "ETB", symbol: "Br", names: ["birr"] },
  { code: "EUR", symbol: "€", names: ["euro", "euros"] },
  { code: "FJD", symbol: "$", names: [] },
  { code: "FKP", symbol: "£", names: [] },
  { code: "GBP", symbol: "£", names: ["pound", "pounds", "sterling"] },
  { code: "GEL", symbol: "₾", names: ["lari"] },
  { code: "GHS", symbol: "₵", names: ["cedi", "cedis"] },
  { code: "GIP", symbol: "£", names: [] },
  { code: "GMD", symbol: "GMD", names: ["dalasi"] },
  { code: "GNF", symbol: "Fr", names: [] },
  { code: "GTQ", symbol: "GTQ", names: ["quetzal", "quetzales"] },
  { code: "GYD", symbol: "$", names: [] },
  { code: "HKD", symbol: "$", names: [] },
  { code: "HNL", symbol: "HNL", names: ["lempira", "lempiras"] },
  { code: "HTG", symbol: "HTG", names: ["gourde", "gourdes"] },
  { code: "HUF", symbol: "Ft", names: ["forint", "forints"] },
  { code: "IDR", symbol: "Rp", names: ["rupiah"] },
  { code: "ILS", symbol: "₪", names: ["shekel", "shekels"] },
  { code: "INR", symbol: "₹", names: ["rupee", "rupees"] },
  { code: "IQD", symbol: "IQD", names: [] },
  { code: "IRR", symbol: "﷼", names: ["rial", "rials"] },
  { code: "ISK", symbol: "kr", names: ["krona", "kronur"] },
  { code: "JMD", symbol: "$", names: [] },
  { code: "JOD", symbol: "JD", names: [] },
  { code: "JPY", symbol: "¥", names: ["yen"] },
  { code: "KES", symbol: "KSh", names: ["shilling", "shillings"] },
  { code: "KGS", symbol: "с", names: ["som"] },
  { code: "KHR", symbol: "៛", names: ["riel", "riels"] },
  { code: "KMF", symbol: "Fr", names: [] },
  { code: "KPW", symbol: "₩", names: ["won"] },
  { code: "KRW", symbol: "₩", names: [] },
  { code: "KWD", symbol: "KD", names: [] },
  { code: "KYD", symbol: "$", names: [] },
  { code: "KZT", symbol: "₸", names: ["tenge"] },
  { code: "LAK", symbol: "₭", names: ["kip"] },
  { code: "LBP", symbol: "L£", names: [] },
  { code: "LKR", symbol: "Rs", names: [] },
  { code: "LRD", symbol: "$", names: [] },
  { code: "LSL", symbol: "LSL", names: ["loti"] },
  { code: "LYD", symbol: "LD", names: [] },
  { code: "MAD", symbol: "DH", names: [] },
  { code: "MDL", symbol: "MDL", names: ["leu"] },
  { code: "MGA", symbol: "Ar", names: ["ariary"] },
  { code: "MKD", symbol: "ден", names: ["denar", "denars"] },
  { code: "MMK", symbol: "MMK", names: ["kyat"] },
  { code: "MNT", symbol: "₮", names: ["tugrik", "tugriks"] },
  { code: "MOP", symbol: "MOP", names: ["pataca", "patacas"] },
  { code: "MRU", symbol: "UM", names: ["ouguiya"] },
  { code: "MUR", symbol: "Rs", names: [] },
  { code: "MVR", symbol: "Rf", names: ["rufiyaa"] },
  { code: "MWK", symbol: "MK", names: ["kwacha"] },
  { code: "MXN", symbol: "$", names: [] },
  { code: "MYR", symbol: "RM", names: ["ringgit"] },
  { code: "MZN", symbol: "MT", names: ["metical", "meticais"] },
  { code: "NAD", symbol: "$", names: [] },
  { code: "NGN", symbol: "₦", names: ["naira"] },
  { code: "NIO", symbol: "C$", names: ["cordoba", "cordobas"] },
  { code: "NOK", symbol: "kr", names: [] },
  { code: "NPR", symbol: "Rs", names: [] },
  { code: "NZD", symbol: "$", names: [] },
  { code: "OMR", symbol: "RO", names: [] },
  { code: "PAB", symbol: "B/.", names: ["balboa", "balboas"] },
  { code: "PEN", symbol: "S/", names: ["sol", "soles"] },
  { code: "PGK", symbol: "PGK", names: ["kina"] },
  { code: "PHP", symbol: "₱", names: [] },
  { code: "PKR", symbol: "Rs", names: [] },
  { code: "PLN", symbol: "zł", names: ["zloty", "zlotys"] },
  { code: "PYG", symbol: "₲", names: ["guarani"] },
  { code: "QAR", symbol: "QR", names: ["riyal", "riyals"] },
  { code: "RON", symbol: "lei", names: [] },
  { code: "RSD", symbol: "din", names: [] },
  { code: "RUB", symbol: "₽", names: ["ruble", "rubles", "rouble", "roubles"] },
  { code: "RWF", symbol: "Fr", names: [] },
  { code: "SAR", symbol: "﷼", names: [] },
  { code: "SBD", symbol: "$", names: [] },
  { code: "SCR", symbol: "Rs", names: [] },
  { code: "SDG", symbol: "LS", names: [] },
  { code: "SEK", symbol: "kr", names: ["kronor"] },
  { code: "SGD", symbol: "$", names: [] },
  { code: "SHP", symbol: "£", names: [] },
  { code: "SLE", symbol: "Le", names: ["leone", "leones"] },
  { code: "SOS", symbol: "Sh", names: [] },
  { code: "SRD", symbol: "$", names: [] },
  { code: "SSP", symbol: "£", names: [] },
  { code: "STN", symbol: "Db", names: ["dobra", "dobras"] },
  { code: "SVC", symbol: "$", names: [] },
  { code: "SYP", symbol: "LS", names: [] },
  { code: "SZL", symbol: "SZL", names: ["lilangeni"] },
  { code: "THB", symbol: "฿", names: ["baht"] },
  { code: "TJS", symbol: "SM", names: ["somoni"] },
  { code: "TMT", symbol: "TMT", names: [] },
  { code: "TND", symbol: "DT", names: [] },
  { code: "TOP", symbol: "T$", names: ["paanga"] },
  { code: "TRY", symbol: "₺", names: ["lira", "liras"] },
  { code: "TTD", symbol: "$", names: [] },
  { code: "TWD", symbol: "NT$", names: [] },
  { code: "TZS", symbol: "Sh", names: [] },
  { code: "UAH", symbol: "₴", names: ["hryvnia"] },
  { code: "UGX", symbol: "USh", names: [] },
  { code: "USD", symbol: "$", names: ["dollar", "dollars", "buck", "bucks"] },
  { code: "UYU", symbol: "$", names: [] },
  { code: "UZS", symbol: "soʻm", names: [] },
  { code: "VES", symbol: "Bs", names: ["bolivar", "bolivars"] },
  { code: "VND", symbol: "₫", names: ["dong"] },
  { code: "VUV", symbol: "Vt", names: ["vatu"] },
  { code: "WST", symbol: "WST", names: ["tala"] },
  { code: "XAF", symbol: "Fr", names: [] },
  { code: "XCD", symbol: "$", names: [] },
  { code: "XOF", symbol: "Fr", names: [] },
  { code: "XPF", symbol: "Fr", names: [] },
  { code: "YER", symbol: "﷼", names: [] },
  { code: "ZAR", symbol: "ZAR", names: ["rand"] },
  { code: "ZMW", symbol: "ZMW", names: [] },
  { code: "ZWL", symbol: "$", names: [] },
];

/** Names that mean the currency even with no number beside them. */
const BARE = new Set([
  "yen",
  "yuan",
  "renminbi",
  "euro",
  "euros",
  "rupee",
  "rupees",
  "baht",
  "naira",
  "ringgit",
  "forint",
  "forints",
  "zloty",
  "zlotys",
  "koruna",
  "hryvnia",
  "tenge",
  "tugrik",
  "tugriks",
  "cedi",
  "cedis",
  "kwacha",
  "quetzal",
  "quetzales",
  "guarani",
  "bolivar",
  "bolivars",
  "boliviano",
  "bolivianos",
  "dirham",
  "dirhams",
  "riyal",
  "riyals",
  "rial",
  "rials",
  "shekel",
  "shekels",
  "ruble",
  "rubles",
  "rouble",
  "roubles",
  "krona",
  "kronur",
  "krone",
  "kroner",
  "kronor",
  "afghani",
  "afghanis",
  "manat",
  "manats",
  "lari",
  "birr",
  "nakfa",
  "dalasi",
  "ngultrum",
  "pataca",
  "patacas",
  "ariary",
  "denar",
  "denars",
  "kyat",
  "riel",
  "riels",
  "rufiyaa",
  "ouguiya",
  "metical",
  "meticais",
  "somoni",
  "dobra",
  "dobras",
  "paanga",
  "vatu",
  "florin",
  "escudo",
  "escudos",
  "rupiah",
  "lempira",
  "lempiras",
  "gourde",
  "gourdes",
  "loti",
  "lilangeni",
]);

/** Lowercase codes that are also ordinary English, so only ALL-CAPS converts. */
const CODE_NEEDS_CAPS = new Set([
  "all",
  "ang",
  "bam",
  "bob",
  "btn",
  "cop",
  "cup",
  "gel",
  "mad",
  "sos",
  "top",
  "try",
]);

const byCode = new Map(CURRENCIES.map((item) => [item.code, item]));
const byName = new Map<string, Currency>();
for (const item of CURRENCIES) {
  for (const name of item.names) byName.set(name, item);
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function byLength(values: readonly string[]): string[] {
  return [...values].sort((a, b) => b.length - a.length || a.localeCompare(b));
}

const NAME_ALT = byLength([...byName.keys()]).map(escapeRe).join("|");
const CODE_ALT = byLength(CURRENCIES.map((item) => item.code)).join("|");
const BARE_ALT = byLength([...BARE]).map(escapeRe).join("|");
const NUM = String.raw`\d[\d,]*(?:\.\d+)?`;

const WORD_RE = new RegExp(
  `(${NUM})(\\s+)(${NAME_ALT}|${CODE_ALT})\\b|\\b(${NAME_ALT}|${CODE_ALT})(\\s+)(${NUM})|\\b(${BARE_ALT})\\b`,
  "gi",
);

function lookupWord(raw: string): Currency | null {
  const name = byName.get(raw.toLowerCase());
  if (name) return name;
  const code = byCode.get(raw.toUpperCase());
  if (!code) return null;
  const lower = raw.toLowerCase();
  const caps = raw === raw.toUpperCase() && raw !== lower;
  if (!caps && CODE_NEEDS_CAPS.has(lower)) return null;
  return code;
}

function isLetters(symbol: string): boolean {
  return /[A-Za-z]/.test(symbol);
}

export type MoneyEdit = { start: number; end: number; text: string };

export function rewriteMoney(line: string): { text: string; edits: MoneyEdit[] } {
  WORD_RE.lastIndex = 0;
  const edits: MoneyEdit[] = [];
  let match: RegExpExecArray | null;
  while ((match = WORD_RE.exec(line))) {
    const index = match.index;
    if (match[7]) {
      const currency = byName.get(match[7].toLowerCase());
      if (!currency) continue;
      edits.push({ start: index, end: index + match[7].length, text: currency.symbol });
      continue;
    }
    if (match[3]) {
      const currency = lookupWord(match[3]);
      if (!currency) continue;
      const num = match[1] ?? "";
      const space = match[2] ?? " ";
      edits.push({
        start: index,
        end: index + match[0].length,
        text: `${num}${space}${currency.symbol}`,
      });
      continue;
    }
    if (match[4]) {
      const currency = lookupWord(match[4]);
      if (!currency) continue;
      const space = match[5] ?? " ";
      const num = match[6] ?? "";
      const text = isLetters(currency.symbol) ? `${currency.symbol}${space}${num}` : `${currency.symbol}${num}`;
      edits.push({ start: index, end: index + match[0].length, text });
    }
  }
  if (edits.length === 0) return { text: line, edits };
  let text = "";
  let cursor = 0;
  for (const edit of edits) {
    text += line.slice(cursor, edit.start) + edit.text;
    cursor = edit.end;
  }
  text += line.slice(cursor);
  return { text, edits };
}

const EXTRA_SYMBOLS = ["Rs", "₨"];

const symbols = byLength([
  ...new Set([...CURRENCIES.map((item) => item.symbol), ...EXTRA_SYMBOLS]),
]);

function symbolPattern(symbol: string): string {
  const body = escapeRe(symbol);
  const starts = /^[A-Za-z]/.test(symbol);
  const ends = /[A-Za-z]$/.test(symbol);
  if (starts && ends) return `\\b${body}\\b`;
  if (starts) return `\\b${body}`;
  if (ends) return `${body}\\b`;
  return body;
}

const SYMBOL_ALT = symbols.map(symbolPattern).join("|");
const CODE_MARK = CURRENCIES.map((item) => item.code).join("|");

/** Amounts in already-escaped note text, for the color layer. */
export const MONEY_AMOUNT = new RegExp(
  `(?:(?:${SYMBOL_ALT})\\s?${NUM})|(?:\\b${NUM}\\s?(?:${SYMBOL_ALT}))|(?:\\b(?:${CODE_MARK}|Rs\\.?)\\s?${NUM})|(?:\\b${NUM}\\s(?:${CODE_MARK}|Rs\\.?)\\b)|(?:${symbols.filter((item) => !isLetters(item)).map(escapeRe).join("|")})`,
  "gi",
);

export function stripMoney(expr: string): string {
  let out = expr;
  for (const symbol of symbols) {
    const flags = symbol === "Rs" || symbol === "₨" ? "gi" : "g";
    out = out.replace(new RegExp(symbolPattern(symbol), flags), "");
  }
  out = out.replace(/\bRs\.?(?=\s|\d|$)/gi, "");
  out = out.replace(/(\d),(?=\d)/g, "$1");
  return out;
}

export type MoneyPrefix = { symbol: string; place: "pre" | "post" };

const MARK_RE = new RegExp(
  `(${SYMBOL_ALT})(\\s*)(${NUM})|(${NUM})(\\s*)(${SYMBOL_ALT})`,
  "g",
);

/** The one currency on an expression, and whether its sign sits before the number. */
export function moneyMark(expr: string): MoneyPrefix | null {
  MARK_RE.lastIndex = 0;
  const found = new Map<string, { pre: number; post: number }>();
  let match: RegExpExecArray | null;
  while ((match = MARK_RE.exec(expr))) {
    const pre = match[1];
    const post = match[6];
    const symbol = pre ?? post ?? "";
    const bucket = found.get(symbol) ?? { pre: 0, post: 0 };
    if (pre) bucket.pre += 1;
    else bucket.post += 1;
    found.set(symbol, bucket);
  }
  if (found.size !== 1) return null;
  const [symbol, counts] = [...found][0] ?? ["", { pre: 0, post: 0 }];
  if (!symbol) return null;
  return { symbol, place: counts.pre >= counts.post ? "pre" : "post" };
}

export function formatMoney(symbol: string, place: "pre" | "post", value: string): string {
  if (place === "pre") return isLetters(symbol) ? `${symbol} ${value}` : `${symbol}${value}`;
  return `${value} ${symbol}`;
}

export function wearsMoney(rhs: string, symbol: string, place: "pre" | "post", value: string): boolean {
  const compact = rhs.replace(/\s/g, "");
  const sym = symbol.replace(/\s/g, "");
  const num = value.replace(/\s/g, "");
  return place === "pre" ? compact === `${sym}${num}` : compact === `${num}${sym}`;
}
