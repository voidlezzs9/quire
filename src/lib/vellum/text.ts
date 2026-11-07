/** Stable key for a checklist line, ignoring bullets and numbering. */
export function lineKey(line: string): string {
  return line
    .trim()
    .replace(/^#{1,3}\s+/, "")
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/^\[[ xX]\]\s+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function filledLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
