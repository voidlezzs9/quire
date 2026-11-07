/**
 * Gives a pasted page room to breathe: a heading on its own line,
 * then a blank line, then the paragraph under it.
 * The editor paints color only, so the space has to be real newlines
 * or the caret slips off the text.
 */

const SENTENCE_START =
  /^(?:The|These|This|That|Those|They|There|Then|A|An|It|We|You|For|And|But|Or|So|In|On|At|With|From|After|Before|When|While|If|As|To|Of|By|People|Premium|Custom|Printable|Beautiful|Sell|App|Quiz)\b/;

function looksLikeCode(text: string): boolean {
  if (/```/.test(text)) return true;
  let hits = 0;
  for (const line of text.split("\n")) {
    if (/^\s*(?:def |class |function |const |let |var |import |export |SELECT |INSERT |FROM |#include|public |private )/.test(line)) {
      hits += 1;
    }
    if (/[{}];/.test(line)) hits += 1;
  }
  return hits >= 3;
}

function unstick(text: string): string {
  return text
    .replace(/([a-z]{6,})([A-Z][a-z]{2,})/g, (match, left: string, right: string) =>
      SENTENCE_START.test(right) ? `${left}\n\n${right}` : match,
    )
    .replace(/([a-z]{3,}[.!?])([A-Z])/g, "$1\n\n$2");
}

function isParagraph(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return trimmed.length >= 48 || /[.!?]"?$/.test(trimmed);
}

function isShortTitle(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 72) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 14) return false;
  if (/[.!?]"?$/.test(trimmed)) return false;
  if (/^(?:[-*•]|\[[ xX]?\])\s/.test(trimmed)) return false;
  return /^[A-Z0-9“"']/.test(trimmed);
}

export function isDisplayHeading(line: string, next?: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,3}\s+\S/.test(trimmed)) return true;
  if (/^\d{1,2}[.)]\s+\S/.test(trimmed) && trimmed.length <= 80 && !/[.!?]"?$/.test(trimmed)) return true;
  if (/^(?:ingredients|method|directions|steps|decisions|action items|next steps|attendees|agenda)$/i.test(trimmed.replace(/:$/, ""))) {
    return true;
  }
  if (/^[A-Z][^:]{1,40}:$/.test(trimmed)) return true;
  return Boolean(next && isShortTitle(trimmed) && isParagraph(next));
}

function wantsAirBefore(line: string, next?: string): boolean {
  const trimmed = line.trim();
  if (/^\d{1,2}[.)]\s+\S/.test(trimmed)) return true;
  return isDisplayHeading(line, next);
}

function nextFilled(lines: readonly string[], index: number): string | undefined {
  for (let i = index + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line?.trim()) return line;
  }
  return undefined;
}

function lastFilled(lines: readonly string[]): string | undefined {
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (line?.trim()) return line;
  }
  return undefined;
}

/** Idempotent. Code is left alone. */
export function tidyProse(text: string): string {
  if (!text.trim() || looksLikeCode(text)) return text;
  const lines = unstick(text).replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const upcoming = nextFilled(lines, i);
    const previous = lastFilled(out);
    const blocked = out.length > 0 && out[out.length - 1]?.trim() !== "";
    if (blocked && line.trim()) {
      if (wantsAirBefore(line, upcoming)) out.push("");
      else if (previous && isDisplayHeading(previous, line) && isParagraph(line)) out.push("");
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}
