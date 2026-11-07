import assert from "node:assert/strict";
import test from "node:test";
import { classify } from "./classify.ts";
import { tidyProse } from "./prose.ts";

const pasted = [
  "1. Digital Products You Can Sell DirectlyThese are low-overhead and easy to start.",
  "Premium Notion / Obsidian / Excel templates",
  "Beautiful anime trackers, seasonal planners, and figure managers. Sell on Gumroad for a small price.",
  "App themes, icon packs, and UI skins",
  "Custom themes for Mihon and Kotatsu. People pay for polished aesthetics.",
].join("\n");

test("a pasted outline gets air between headings and paragraphs", () => {
  const tidy = tidyProse(pasted);
  assert.equal(
    tidy,
    [
      "1. Digital Products You Can Sell Directly",
      "",
      "These are low-overhead and easy to start.",
      "",
      "Premium Notion / Obsidian / Excel templates",
      "",
      "Beautiful anime trackers, seasonal planners, and figure managers. Sell on Gumroad for a small price.",
      "",
      "App themes, icon packs, and UI skins",
      "",
      "Custom themes for Mihon and Kotatsu. People pay for polished aesthetics.",
    ].join("\n"),
  );
  assert.equal(tidyProse(tidy), tidy);
});

test("an outline is a page, not minutes", () => {
  const reading = classify(`Anime Content ideas\n${tidyProse(pasted)}`);
  assert.equal(reading.form, "plain", JSON.stringify(reading.scores));
});

test("code is not spaced out", () => {
  const source = "def split(text):\n    return text\n\nclass Jar:\n    def __init__(self):\n        self.n = 0\n";
  assert.equal(tidyProse(source), source);
});
