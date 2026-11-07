import assert from "node:assert/strict";
import test from "node:test";
import { exportChoices, renderPdf } from "./export.ts";

const py = "def greet(name):\n    return f'hello {name}'\n";
const sql = "SELECT id, title\nFROM notes\nWHERE updated_at > now();\n";

test("a python note saves as a script and a notebook", () => {
  const choices = exportChoices("code", "Greet", py);
  const ids = choices.map((choice) => choice.id);
  assert.ok(ids.includes("py") || ids.includes("python"));
  const script = choices.find((choice) => choice.file.name.endsWith(".py"));
  const book = choices.find((choice) => choice.file.name.endsWith(".ipynb"));
  assert.ok(script);
  assert.match(script.file.body, /def greet/);
  assert.ok(book);
  const nb = JSON.parse(book.file.body) as { cells: { cell_type: string }[] };
  assert.equal(nb.cells[0]?.cell_type, "code");
});

test("sql saves as a sql file", () => {
  const choices = exportChoices("code", "Recent notes", sql);
  const file = choices.find((choice) => choice.file.name.endsWith(".sql"));
  assert.ok(file);
  assert.match(file.file.body, /^SELECT id/m);
});

test("a named script keeps its extension", () => {
  const choices = exportChoices("code", "debounce.ts", "export function debounce(fn, wait = 280) {\n  return fn;\n}\n");
  const file = choices.find((choice) => choice.id === "javascript" || choice.id === "typescript");
  assert.equal(file?.file.name, "debounce.ts");
});

test("a list becomes a sheet", () => {
  const choices = exportChoices("list", "Market run", "- sourdough\n- lemons", ["sourdough"]);
  const sheet = choices.find((choice) => choice.ext === ".csv");
  assert.ok(sheet);
  assert.match(sheet.file.body, /Item,Done/);
  assert.match(sheet.file.body, /sourdough,yes/);
  assert.match(sheet.file.body, /lemons,no/);
});

test("prose stays text and pdf", () => {
  const choices = exportChoices("journal", "Rain", "Today I left late.");
  assert.deepEqual(
    choices.map((choice) => choice.ext),
    [".txt", ".pdf"],
  );
  assert.match(renderPdf("Rain", "Today I left late."), /^%PDF-1\.4/);
  assert.match(renderPdf("Rain", "Today I left late."), /Today I left late/);
});
