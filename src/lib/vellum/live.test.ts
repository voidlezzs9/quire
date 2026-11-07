import assert from "node:assert/strict";
import test from "node:test";
import { settleBody, settleLine } from "./live.ts";

test("an equals sign finishes the line", () => {
  assert.equal(settleLine("1 + 2 ="), "1 + 2 = 3");
  assert.equal(settleLine("sin(30) ="), "sin(30) = 0.5");
  assert.equal(settleLine("(2+3)*4 ="), "(2+3)*4 = 20");
});

test("a wrong result follows the expression", () => {
  assert.equal(settleLine("1 + 4 = 3"), "1 + 4 = 5");
});

test("prose and unfinished lines stay as typed", () => {
  assert.equal(settleLine("the total ="), "the total =");
  assert.equal(settleLine("1 +"), "1 +");
  assert.equal(settleLine("1 + 2 = 3"), "1 + 2 = 3");
  assert.equal(settleLine("Voltage 240 V ="), "Voltage 240 V =");
});

test("yen becomes the yen symbol", () => {
  assert.equal(settleLine("500 yen"), "500 ¥");
  assert.equal(settleLine("the Kenyan coast"), "the Kenyan coast");
});

test("a currency sum keeps its symbol", () => {
  assert.equal(settleLine("$10 + $5 ="), "$10 + $5 = $15");
  assert.equal(settleLine("Rs 500 + Rs 20 ="), "Rs 500 + Rs 20 = Rs 520");
});

test("only the line at the caret is settled", () => {
  const body = "eggs\n1 + 2 =";
  const settled = settleBody(body, body.length);
  assert.equal(settled.text, "eggs\n1 + 2 = 3");
  assert.equal(settled.caret, settled.text.length);
});
