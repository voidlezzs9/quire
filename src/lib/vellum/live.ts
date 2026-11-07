import { formatMoney, moneyMark, rewriteMoney, stripMoney, wearsMoney } from "./currencies.ts";

type Tok =
  | { t: "n"; v: number }
  | { t: "op"; v: string }
  | { t: "fn"; v: string }
  | { t: "lp" }
  | { t: "rp" };

const TOKEN = /^(sin|cos|tan|log|ln|sqrt|abs|pi|e|\d+\.?\d*|\.\d+|[+*/^(),\-])/;

function tokenize(input: string): Tok[] {
  const src = input
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\*\*/g, "^");
  const tokens: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    if (/\s/.test(src[i] ?? "")) {
      i += 1;
      continue;
    }
    const match = src.slice(i).match(TOKEN);
    if (!match) throw new Error("bad");
    const part = match[1] ?? "";
    i += part.length;
    if (/^\d/.test(part) || part.startsWith(".")) tokens.push({ t: "n", v: Number(part) });
    else if (part === "pi") tokens.push({ t: "n", v: Math.PI });
    else if (part === "e") tokens.push({ t: "n", v: Math.E });
    else if ("+-*/^".includes(part)) tokens.push({ t: "op", v: part });
    else if (part === "(") tokens.push({ t: "lp" });
    else if (part === ")") tokens.push({ t: "rp" });
    else tokens.push({ t: "fn", v: part });
  }
  return tokens;
}

function applyFn(name: string, arg: number): number {
  const radians = (arg * Math.PI) / 180;
  switch (name) {
    case "sin":
      return Math.sin(radians);
    case "cos":
      return Math.cos(radians);
    case "tan":
      return Math.tan(radians);
    case "log":
      return Math.log10(arg);
    case "ln":
      return Math.log(arg);
    case "sqrt":
      return Math.sqrt(arg);
    case "abs":
      return Math.abs(arg);
    default:
      throw new Error(name);
  }
}

function evaluate(input: string): number {
  const tokens = tokenize(input);
  if (!tokens.length) throw new Error("empty");
  let i = 0;
  const peek = () => tokens[i];
  const eat = () => {
    const tok = tokens[i];
    i += 1;
    return tok;
  };

  const expr = (): number => {
    let left = term();
    let tok = peek();
    while (tok?.t === "op" && (tok.v === "+" || tok.v === "-")) {
      eat();
      const right = term();
      left = tok.v === "+" ? left + right : left - right;
      tok = peek();
    }
    return left;
  };

  const term = (): number => {
    let left = pow();
    let tok = peek();
    while (tok?.t === "op" && (tok.v === "*" || tok.v === "/")) {
      eat();
      const right = pow();
      left = tok.v === "*" ? left * right : left / right;
      tok = peek();
    }
    return left;
  };

  const pow = (): number => {
    const base = unary();
    const tok = peek();
    if (tok?.t === "op" && tok.v === "^") {
      eat();
      return base ** pow();
    }
    return base;
  };

  const unary = (): number => {
    const tok = peek();
    if (tok?.t === "op" && tok.v === "-") {
      eat();
      return -unary();
    }
    if (tok?.t === "fn") {
      eat();
      return applyFn(tok.v, primary());
    }
    return primary();
  };

  const primary = (): number => {
    const tok = peek();
    if (!tok) throw new Error("end");
    if (tok.t === "n") {
      eat();
      return tok.v;
    }
    if (tok.t === "lp") {
      eat();
      const value = expr();
      if (peek()?.t !== "rp") throw new Error("paren");
      eat();
      return value;
    }
    throw new Error("primary");
  };

  const value = expr();
  if (i !== tokens.length || !Number.isFinite(value)) throw new Error("bad");
  return value;
}

function formatNum(value: number): string {
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-8 || abs >= 1e10)) return value.toExponential(6);
  const text = value.toFixed(10).replace(/\.?0+$/, "");
  return text === "-0" ? "0" : text;
}

function isCalculable(expr: string): boolean {
  const stripped = expr.replace(/\b(sin|cos|tan|log|ln|sqrt|abs|pi|e)\b/gi, "");
  if (/[a-z]/i.test(stripped)) return false;
  return /[+\-*/^×÷]|√|\b(sin|cos|tan|log|ln|sqrt|abs)\b/i.test(expr) && /\d|π|\bpi\b/i.test(expr);
}

const NUMBER = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i;

/** Currency names and codes become their signs. `500 yen` becomes `500 ¥`. */
export function spellMoney(line: string): string {
  return rewriteMoney(line).text;
}

/**
 * If this line is a live expression, finish it.
 * `1 + 2 =` becomes `1 + 2 = 3`. Prose that happens to contain "=" stays put.
 * `500 yen` becomes `500 ¥`. `$10 + $5 =` becomes `$10 + $5 = $15`.
 * `12 euros` becomes `12 €`. `500 JPY` becomes `500 ¥`.
 */
export function settleLine(line: string): string {
  const spelled = spellMoney(line);
  const match = spelled.match(/^(.*?)=([^\n]*)$/);
  if (!match) return spelled;
  const left = match[1] ?? "";
  const rhs = (match[2] ?? "").trim();
  const expr = left.trim();
  const bare = stripMoney(expr).trim();
  if (!isCalculable(bare)) return spelled;
  const rhsBare = stripMoney(rhs).trim();
  if (rhsBare !== "" && !NUMBER.test(rhsBare)) return spelled;
  let value: string;
  try {
    value = formatNum(evaluate(bare));
  } catch {
    return spelled;
  }
  const mark = moneyMark(expr);
  const shown = mark ? formatMoney(mark.symbol, mark.place, value) : value;
  const already =
    rhsBare === value && (mark === null || wearsMoney(rhs, mark.symbol, mark.place, value));
  if (already) return spelled;
  return `${left.trimEnd()} = ${shown}`;
}

export function settleBody(text: string, caret: number): { text: string; caret: number } {
  const safe = Math.max(0, Math.min(caret, text.length));
  const start = text.lastIndexOf("\n", Math.max(0, safe - 1)) + 1;
  const breakAt = text.indexOf("\n", safe);
  const end = breakAt === -1 ? text.length : breakAt;
  const line = text.slice(start, end);
  const local = safe - start;
  const contentEnd = line.trimEnd().length;
  const settled = settleLine(line);
  if (settled === line) return { text, caret: safe };
  const rhs = line.slice(line.indexOf("=") + 1).trim();
  const editingMiddle = local < contentEnd && rhs === "" && settled.includes("=");
  if (editingMiddle) return { text, caret: safe };
  const next = text.slice(0, start) + settled + text.slice(end);
  const nextCaret = start + mapCaret(line, settled, local);
  return { text: next, caret: nextCaret };
}

function mapCaret(before: string, after: string, caret: number): number {
  if (caret >= before.trimEnd().length) return after.length;
  const { edits } = rewriteMoney(before);
  let shift = 0;
  for (const edit of edits) {
    const delta = edit.end - edit.start - edit.text.length;
    if (edit.end <= caret) shift += delta;
    else if (edit.start < caret) return Math.min(edit.start - shift + edit.text.length, after.length);
    else break;
  }
  return Math.min(Math.max(0, caret - shift), after.length);
}
