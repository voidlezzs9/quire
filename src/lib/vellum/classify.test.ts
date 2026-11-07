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
