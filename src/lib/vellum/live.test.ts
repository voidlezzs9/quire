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
  assert.equal(settleLine("USD 10 + USD 5 ="), "$10 + $5 = $15");
  assert.equal(settleLine("10 dollars + 5 dollars ="), "10 $ + 5 $ = 15 $");
});

test("currency names and codes become their signs", () => {
  assert.equal(settleLine("12 euros"), "12 €");
  assert.equal(settleLine("euro 12"), "€12");
  assert.equal(settleLine("500 JPY"), "500 ¥");
  assert.equal(settleLine("20 inr"), "20 ₹");
  assert.equal(settleLine("500 pounds"), "500 £");
  assert.equal(settleLine("TRY 40"), "₺40");
  assert.equal(settleLine("500 won"), "500 ₩");
  assert.equal(settleLine("try 500"), "try 500");
  assert.equal(settleLine("I won the race"), "I won the race");
  assert.equal(settleLine("pound the dough"), "pound the dough");
  assert.equal(settleLine("the euro zone"), "the € zone");
});

test("only the line at the caret is settled", () => {
  const body = "eggs\n1 + 2 =";
  const settled = settleBody(body, body.length);
  assert.equal(settled.text, "eggs\n1 + 2 = 3");
  assert.equal(settled.caret, settled.text.length);
});
