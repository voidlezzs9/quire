import assert from "node:assert/strict";
import test from "node:test";
import { renderMarks } from "./marks.ts";

test("a journey time is colored without leaking the tag", () => {
  const html = renderMarks("08:10 Flight lands. Airport metro toward Baixa.", "journey", []);
  assert.equal(
    html,
    '<span class="mk-time">08:10 </span>Flight lands. Airport metro toward Baixa.',
  );
  assert.equal(html.includes("mk-key"), false);
});

test("a recipe amount is colored without leaking the tag", () => {
  const html = renderMarks("1 tbsp olive oil", "recipe", []);
  assert.equal(html, '<span class="mk-qty">1 tbsp</span> olive oil');
  assert.equal(html.includes("mk-key"), false);
});

test("a code keyword is still colored", () => {
  const html = renderMarks("class Foo", "code", []);
  assert.equal(html, '<span class="mk-key">class</span> Foo');
});

test("typed brackets stay text", () => {
  assert.equal(renderMarks("a < b & c", "plain", []), "a &lt; b &amp; c");
});

test("a finished sum still colors the result", () => {
  assert.equal(renderMarks("2 * 400 = 800", "recipe", []), '2 * 400 = <span class="mk-result">800</span>');
});
