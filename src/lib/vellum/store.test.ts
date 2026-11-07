import assert from "node:assert/strict";
import test from "node:test";
import { mergeWithSamples, seedNotes, type Note } from "./store.ts";

function save(notes: Note[], dismissed: string[] = [], introduced?: string[]) {
  return mergeWithSamples({
    notes,
    activeId: notes[0]?.id ?? "",
    dismissed,
    introduced: introduced ?? notes.filter((note) => note.example).map((note) => note.id),
  });
}

test("a dismissed sample stays gone while a new sample can arrive", () => {
  const seeded = seedNotes();
  const kept = seeded.filter((note) => note.id !== "sample-verse");
  const merged = save(kept, ["sample-verse"], kept.map((note) => note.id));
  assert.equal(merged.notes.some((note) => note.id === "sample-verse"), false);
  assert.equal(merged.notes.some((note) => note.id === "sample-chili"), true);
});

test("an edited sample is not replaced by the original", () => {
  const seeded = seedNotes();
  const edited = seeded.map((note) =>
    note.id === "sample-chili" ? { ...note, title: "My chili", example: false } : note,
  );
  const merged = save(edited, [], seeded.map((note) => note.id));
  const chili = merged.notes.find((note) => note.id === "sample-chili");
  assert.equal(chili?.title, "My chili");
  assert.equal(chili?.example, false);
});
