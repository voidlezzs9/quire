import assert from "node:assert/strict";
import test from "node:test";
import { notebookToText, textFromFile, titleFromFilename } from "./documents.ts";

test("a code filename keeps its extension", () => {
  assert.equal(titleFromFilename("debounce.ts"), "debounce.ts");
  assert.equal(titleFromFilename("C:\\Users\\Sam\\Documents\\cells.py"), "cells.py");
});

test("a text filename drops the extension", () => {
  assert.equal(titleFromFilename("Weeknight chili.txt"), "Weeknight chili");
});

test("a notebook becomes cell markers", () => {
  const raw = JSON.stringify({
    cells: [
      { cell_type: "markdown", source: ["Split the starter\n"] },
      { cell_type: "code", source: ["print(split(200))\n"] },
    ],
  });
  assert.equal(notebookToText(raw), "# %% [markdown]\nSplit the starter\n\n# %%\nprint(split(200))");
  assert.match(textFromFile("cells.ipynb", raw), /# %% \[markdown\]/);
});
