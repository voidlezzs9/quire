import type { FormId } from "./forms.ts";
import { lineKey } from "./text.ts";

function esc(value: string): string {
  return value
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function markInline(escaped: string): string {
  return escaped
    .replace(
      /\b\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?\b/g,
      (match) => `<span class="mk-time">${match}</span>`,
    )
    .replace(
      /\b\d+(?:[./]\d+)?\s*(?:cups?|tbsp|tsp|teaspoons?|tablespoons?|grams?|kg|ml|oz|ounces?|lbs?|pounds?|cloves?|pinches?)\b/gi,
      (match) => `<span class="mk-qty">${match}</span>`,
    )
    .replace(
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
  return escaped
    .replace(
      /\b(sin|cos|tan|log|ln|sqrt|abs)\b(?=\s*\()/gi,
      (match) => `<span class="mk-key">${match}</span>`,
    )
    .replace(new RegExp(`\\b(${CODE_WORD})\\b`, "gi"), (match) => `<span class="mk-key">${match}</span>`);
}

function markMoney(escaped: string): string {
  return escaped.replace(
    /(?:[$€£¥₹]\s?\d[\d,]*(?:\.\d+)?)|(?:\b\d[\d,]*(?:\.\d+)?\s?[$€£¥₹])|(?:\b(?:Rs\.?|INR|USD|EUR|GBP)\s?\d[\d,]*(?:\.\d+)?)/gi,
    (match) => `<span class="mk-money">${match}</span>`,
  );
}

function markResult(escaped: string, raw: string): string {
  if (!/=\s*-?\d/.test(raw)) return escaped;
  return escaped.replace(
    /(=\s*)(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*$/i,
    `$1<span class="mk-result">$2</span>`,
  );
}

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (/^#{1,3}\s+\S/.test(trimmed)) return true;
  if (/^(?:ingredients|method|directions|steps|decisions|action items|next steps|attendees|agenda)$/i.test(trimmed.replace(/:$/, ""))) {
    return true;
  }
  return /^[A-Z][^:]{1,40}:$/.test(trimmed);
}

/**
 * Color marks only — weight, size, and letter-spacing would desync the caret
 * from the transparent textarea sitting on top of this layer.
 */
export function renderMarks(text: string, form: FormId, checked: readonly string[]): string {
  const done = new Set(checked);
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      const key = lineKey(line);
      const struck = key.length > 0 && done.has(key);
      const escaped = esc(line);
      let html = form === "code" ? markCode(line) : markWords(markInline(escaped));
      html = markMoney(html);
      html = markResult(html, line);
      if (form !== "code" && isHeading(line)) html = `<span class="mk-h">${html}</span>`;
      if (struck) html = `<span class="mk-done">${html}</span>`;
      return html;
    })
    .join("\n");
}

export function escapeText(value: string): string {
  return esc(value);
}
