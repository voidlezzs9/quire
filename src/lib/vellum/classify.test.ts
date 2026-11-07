import assert from "node:assert/strict";
import test from "node:test";
import { classify } from "./classify.ts";
import { SAMPLES } from "./samples.ts";

for (const sample of SAMPLES) {
  test(`${sample.key} reads as ${sample.expect}`, () => {
    const reading = classify(`${sample.title}\n${sample.body}`);
    assert.equal(
      reading.form,
      sample.expect,
      `${sample.key} → ${reading.form} (${reading.score.toFixed(2)}) ${JSON.stringify(reading.scores)}`,
    );
  });
}

test("a vague sentence stays a page", () => {
  const reading = classify("We should probably rename the project before Friday.");
  assert.equal(reading.form, "plain");
});

test("Dear someone flips early", () => {
  const reading = classify("Dear Nia, I kept the fig");
  assert.equal(reading.form, "letter");
});

test("four grocery lines become a list", () => {
  const reading = classify("Hello world\ncarrot\ncucumber\ntomato\npeanuts");
  assert.equal(reading.form, "list", JSON.stringify(reading.scores));
});

test("Hello world with a print is code", () => {
  const reading = classify('Hello world\nprint("Hello World!")');
  assert.equal(reading.form, "code", JSON.stringify(reading.scores));
});

test("Hello someone with a close is still a letter", () => {
  const reading = classify("Hello Nia,\n\nCome by Sunday.\n\nYours,\nSam");
  assert.equal(reading.form, "letter");
});
