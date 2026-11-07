import { extract } from "./extract.ts";
import type { FormId } from "./forms.ts";

export type ExportFile = {
  name: string;
  mime: string;
  body: string;
};

export type ExportChoice = {
  id: string;
  label: string;
  ext: string;
  file: ExportFile;
};

type Language = "python" | "sql" | "javascript" | "typescript";

const SHEET_FORMS: ReadonlySet<FormId> = new Set(["list", "recipe", "minutes", "journey", "study", "sparks"]);

function slug(title: string): string {
  const base = title.replace(/\.[a-z0-9]{1,8}$/i, "").trim().toLowerCase();
  const cleaned = base.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return cleaned || "note";
}

function titledText(title: string, body: string): string {
  const head = title.trim();
  const rest = body.replace(/\r\n/g, "\n").replace(/^\n+|\n+$/g, "");
  if (!head) return `${rest}\n`;
  if (!rest) return `${head}\n`;
  return `${head}\n\n${rest}\n`;
}

function stripFences(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/^```[a-z0-9]*\n/gim, "")
    .replace(/^```\s*$/gm, "")
    .replace(/^\n+|\n+$/g, "");
}

function tally(text: string, re: RegExp): number {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  return [...text.matchAll(new RegExp(re.source, flags))].length;
}

function languageOf(title: string, body: string): Language | null {
  const named = title.match(/\.(py|ipynb|sql|js|mjs|cjs|ts|tsx|jsx)$/i)?.[1]?.toLowerCase();
  if (named === "py" || named === "ipynb") return "python";
  if (named === "sql") return "sql";
  if (named === "ts" || named === "tsx") return "typescript";
  if (named === "js" || named === "mjs" || named === "cjs" || named === "jsx") return "javascript";

  const source = stripFences(body);
  const scores: Record<Language, number> = {
    python:
      tally(source, /\bdef\b/) * 3 +
      tally(source, /^\s*(?:from\s+\S+\s+import|import\s+\S+)/m) * 2 +
      tally(source, /\b(elif|None|self)\b/),
    sql: tally(source, /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/),
    typescript: tally(source, /\b(interface|implements|readonly)\b|:\s*(?:string|number|boolean|any|void)\b/),
    javascript: tally(source, /\b(function|const|let|var|return|export|import)\b|=>/),
  };
  const ranked = (Object.keys(scores) as Language[]).sort((a, b) => scores[b] - scores[a]);
  const best = ranked[0];
  if (!best || scores[best] < 2) return null;
  return best;
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csv(rows: string[][]): string {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function sheetFile(form: FormId, title: string, body: string, checked: readonly string[]): ExportFile | null {
  if (!SHEET_FORMS.has(form)) return null;
  const card = extract(form, title, body, checked);
  const rows: string[][] = [];
  if (form === "list") {
    rows.push(["Item", "Done"]);
    for (const group of card.groups) {
      for (const item of group.items) rows.push([item.text, item.done ? "yes" : "no"]);
    }
  } else if (form === "recipe") {
    rows.push(["Section", "Line"]);
    for (const group of card.groups) {
      for (const item of group.items) rows.push([group.title, item.text]);
    }
  } else if (form === "journey") {
    rows.push(["Time", "Stop"]);
    for (const group of card.groups) {
      for (const item of group.items) rows.push([item.detail ?? "", item.text]);
    }
  } else if (form === "study") {
    rows.push(["Term", "Meaning"]);
    for (const group of card.groups) {
      for (const item of group.items) rows.push([item.detail ?? "", item.text]);
    }
  } else if (form === "minutes") {
    rows.push(["Kind", "Note"]);
    for (const group of card.groups) {
      for (const item of group.items) rows.push([group.title, item.text]);
    }
  } else {
    rows.push(["Line"]);
    for (const group of card.groups) {
      for (const item of group.items) rows.push([item.text]);
    }
  }
  if (rows.length < 2) return null;
  return { name: `${slug(title)}.csv`, mime: "text/csv;charset=utf-8", body: csv(rows) };
}

function cellSource(text: string): string[] {
  const lines = text.replace(/^\n+|\n+$/g, "").split("\n");
  return lines.map((line, index) => (index < lines.length - 1 ? `${line}\n` : line));
}

function notebook(title: string, body: string): ExportFile {
  const source = stripFences(body);
  const marked = source.split(/^(# %%[^\n]*)$/m);
  const cells: { kind: "code" | "markdown"; text: string }[] = [];
  if (marked.length === 1) cells.push({ kind: "code", text: source });
  else {
    let pending: "code" | "markdown" = "code";
    for (const part of marked) {
      if (/^# %%/.test(part)) {
        pending = /\[markdown\]/i.test(part) ? "markdown" : "code";
        continue;
      }
      const text = part.replace(/^\n+|\n+$/g, "");
      if (text) cells.push({ kind: pending, text });
    }
  }
  const nb = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python" },
    },
    cells: cells.map((cell) =>
      cell.kind === "markdown"
        ? { cell_type: "markdown", metadata: {}, source: cellSource(cell.text) }
        : { cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: cellSource(cell.text) },
    ),
  };
  return {
    name: `${slug(title)}.ipynb`,
    mime: "application/json",
    body: `${JSON.stringify(nb, null, 2)}\n`,
  };
}

function sourceFile(title: string, body: string, language: Language): ExportFile {
  const source = `${stripFences(body)}\n`;
  const ext = language === "python" ? "py" : language === "sql" ? "sql" : language === "typescript" ? "ts" : "js";
  const named = title.match(/\.(py|sql|js|mjs|ts|tsx)$/i)?.[1]?.toLowerCase();
  const family: Record<Language, string[]> = {
    python: ["py"],
    sql: ["sql"],
    javascript: ["js", "mjs", "ts", "tsx"],
    typescript: ["ts", "tsx", "js"],
  };
  const name = named && family[language].includes(named) ? title.trim().replace(/\s+/g, "-") : `${slug(title)}.${ext}`;
  const mime = language === "sql" ? "application/sql" : "text/plain;charset=utf-8";
  return { name, mime, body: source };
}

/** Minimal text PDF. Characters outside WinAnsi are folded to ASCII so the file still opens. */
export function renderPdf(title: string, body: string): string {
  const plain = toAscii(titledText(title, body)).replace(/\n+$/g, "");
  const wrapped = wrap(plain, 88);
  const pageSize = 46;
  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += pageSize) pages.push(wrapped.slice(i, i + pageSize));
  if (!pages.length) pages.push([""]);

  const objects: string[] = [];
  const pageIds: number[] = [];
  const fontId = 3;
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((lines, index) => {
    const contentId = 4 + index * 2;
    const pageId = contentId + 1;
    pageIds.push(pageId);
    const commands = ["BT", "/F1 11 Tf", "54 742 Td", "14 TL", ...lines.map((line) => `(${pdfEscape(line)}) Tj T*`), "ET"];
    const stream = commands.join("\n");
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`;
  });
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let id = 1; id < objects.length; id += 1) {
    const body = objects[id];
    if (!body) continue;
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${body}\nendobj\n`;
  }
  const xref = pdf.length;
  const count = objects.length;
  pdf += `xref\n0 ${count}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id < count; id += 1) {
    pdf += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function toAscii(value: string): string {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/[^\n\x20-\x7e]/g, "?");
}

function wrap(value: string, width: number): string[] {
  const lines: string[] = [];
  for (const raw of value.split("\n")) {
    if (!raw) {
      lines.push("");
      continue;
    }
    let rest = raw;
    while (rest.length > width) {
      let cut = rest.lastIndexOf(" ", width);
      if (cut < 16) cut = width;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    lines.push(rest);
  }
  return lines;
}

export function exportChoices(
  form: FormId,
  title: string,
  body: string,
  checked: readonly string[] = [],
): ExportChoice[] {
  const name = slug(title);
  const choices: ExportChoice[] = [
    {
      id: "txt",
      label: "Text",
      ext: ".txt",
      file: { name: `${name}.txt`, mime: "text/plain;charset=utf-8", body: titledText(title, body) },
    },
    {
      id: "pdf",
      label: "PDF",
      ext: ".pdf",
      file: { name: `${name}.pdf`, mime: "application/pdf", body: renderPdf(title, body) },
    },
  ];

  const sheet = sheetFile(form, title, body, checked);
  if (sheet) choices.push({ id: "csv", label: "Sheet", ext: ".csv", file: sheet });

  const code = languageOf(title, body);
  if (code && (form === "code" || code === "python" || code === "sql")) {
    const file = sourceFile(title, body, code);
    const label = code === "python" ? "Python" : code === "sql" ? "SQL" : code === "typescript" ? "TypeScript" : "JavaScript";
    choices.push({ id: code, label, ext: `.${file.name.split(".").pop()}`, file });
    if (code === "python") {
      const nb = notebook(title, body);
      choices.push({ id: "ipynb", label: "Notebook", ext: ".ipynb", file: nb });
    }
  }
  return choices;
}

export function saveExport(file: ExportFile): void {
  const blob = new Blob([file.body], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}
