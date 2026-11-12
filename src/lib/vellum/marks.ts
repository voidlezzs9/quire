import { MONEY_AMOUNT } from "./currencies.ts";
import type { FormId } from "./forms.ts";
import { isDisplayHeading } from "./prose.ts";
import { lineKey } from "./text.ts";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Keyword passes must not see the word "class" inside a span we already wrote. */
function replaceText(html: string, pattern: RegExp, wrap: (match: string) => string): string {
  return html
    .split(/(<[^>]*>)/g)
    .map((part) => {
      if (part.startsWith("<")) return part;
      pattern.lastIndex = 0;
      return part.replace(pattern, wrap);
    })
    .join("");
}

function markInline(escaped: string): string {
  const timed = replaceText(
    escaped,
    /\b\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?\b/g,
    (match) => `<span class="mk-time">${match}</span>`,
  );
  const measured = replaceText(
    timed,
    /\b\d+(?:[./]\d+)?\s*(?:cups?|tbsp|tsp|teaspoons?|tablespoons?|grams?|kg|ml|oz|ounces?|lbs?|pounds?|cloves?|pinches?)\b/gi,
    (match) => `<span class="mk-qty">${match}</span>`,
  );
  return replaceText(
    measured,
    /\b\d{2,3}\s*°\s*[fc]?\b/gi,
    (match) => `<span class="mk-time">${match}</span>`,
  );
}

const CODE_WORD =
  "function|const|let|var|import|export|return|class|def|async|await|interface|elif|lambda|print|console|SELECT|INSERT|FROM|WHERE";

function markCode(line: string): string {
  return esc(line).replace(
    new RegExp(`\\b(${CODE_WORD}|if|else|from|type|new)\\b`, "gi"),
    (match) => `<span class="mk-key">${match}</span>`,
  );
}

function markWords(escaped: string): string {
  const named = replaceText(
    escaped,
    /\b(sin|cos|tan|log|ln|sqrt|abs)\b(?=\s*\()/gi,
    (match) => `<span class="mk-key">${match}</span>`,
  );
  return replaceText(
    named,
    new RegExp(`\\b(${CODE_WORD})\\b`, "gi"),
    (match) => `<span class="mk-key">${match}</span>`,
  );
}

function markMoney(escaped: string): string {
  MONEY_AMOUNT.lastIndex = 0;
  return replaceText(escaped, MONEY_AMOUNT, (match) => `<span class="mk-money">${match}</span>`);
}

function markResult(escaped: string, raw: string): string {
  if (!/=\s*-?\d/.test(raw)) return escaped;
  return escaped
    .split(/(<[^>]*>)/g)
    .map((part) =>
      part.startsWith("<")
        ? part
        : part.replace(
            /(=\s*)(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*$/i,
            `$1<span class="mk-result">$2</span>`,
          ),
    )
    .join("");
}

/**
 * Color marks only — weight, size, and letter-spacing would desync the caret
 * from the transparent textarea sitting on top of this layer.
 */
export function renderMarks(text: string, form: FormId, checked: readonly string[]): string {
  const done = new Set(checked);
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  return lines
    .map((line, index) => {
      const next = lines.slice(index + 1).find((item) => item.trim());
      const key = lineKey(line);
      const struck = key.length > 0 && done.has(key);
      const escaped = esc(line);
      let html = form === "code" ? markCode(line) : markWords(markInline(escaped));
      html = markMoney(html);
      html = markResult(html, line);
      if (form !== "code" && isDisplayHeading(line, next)) html = `<span class="mk-h">${html}</span>`;
      if (struck) html = `<span class="mk-done">${html}</span>`;
      return html;
    })
    .join("\n");
}

export function escapeText(value: string): string {
  return esc(value);
}
