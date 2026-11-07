export const FORM_IDS = [
  "plain",
  "journal",
  "minutes",
  "recipe",
  "list",
  "verse",
  "letter",
  "journey",
  "study",
  "code",
  "story",
  "sparks",
] as const;

export type FormId = (typeof FORM_IDS)[number];

export type ShapedId = Exclude<FormId, "plain">;

export type FormMeta = {
  label: string;
  kicker: string;
  reason: string;
  placeholder: string;
};

export const FORM_META: Record<FormId, FormMeta> = {
  plain: {
    label: "Page",
    kicker: "Note",
    reason: "No shape yet.",
    placeholder:
      "Start anywhere. A list, a letter, a recipe, a few lines of verse — the page will catch on.",
  },
  journal: {
    label: "Journal",
    kicker: "Journal",
    reason: "First person, and a day being kept.",
    placeholder: "What did today actually feel like?",
  },
  minutes: {
    label: "Minutes",
    kicker: "Minutes",
    reason: "Decisions, owners, and the next step.",
    placeholder: "Who was there, what was decided, who owns the next step.",
  },
  recipe: {
    label: "Recipe",
    kicker: "Kitchen",
    reason: "Measures, heat, and a method.",
    placeholder: "Ingredients first. Then the heat.",
  },
  list: {
    label: "List",
    kicker: "List",
    reason: "Short lines. Things to do or fetch.",
    placeholder: "One thing per line.",
  },
  verse: {
    label: "Verse",
    kicker: "Verse",
    reason: "The line breaks are doing the work.",
    placeholder: "Break the line where the breath breaks.",
  },
  letter: {
    label: "Letter",
    kicker: "Letter",
    reason: "It opens and closes like a letter.",
    placeholder: "Dear —",
  },
  journey: {
    label: "Journey",
    kicker: "Journey",
    reason: "Times and places, in order.",
    placeholder: "A time, then a place.",
  },
  study: {
    label: "Study",
    kicker: "Study",
    reason: "Terms, and what they mean.",
    placeholder: "Term: the idea in one sentence.",
  },
  code: {
    label: "Code",
    kicker: "Source",
    reason: "This is written for a machine.",
    placeholder: "A function, a snippet, a note to your future self.",
  },
  story: {
    label: "Story",
    kicker: "Story",
    reason: "Narrative prose, with people speaking.",
    placeholder: "Someone is about to do something.",
  },
  sparks: {
    label: "Sparks",
    kicker: "Sparks",
    reason: "Fragments and what-ifs.",
    placeholder: "One spark per line. Questions welcome.",
  },
};

/** Chip order. Page sits with the shapes so a note can be held as plain paper. */
export const CHIP_IDS: FormId[] = [...FORM_IDS];

export function asPhrase(form: FormId): string {
  switch (form) {
    case "plain":
      return "a plain page";
    case "journal":
      return "a journal";
    case "minutes":
      return "minutes";
    case "recipe":
      return "a recipe";
    case "list":
      return "a list";
    case "verse":
      return "verse";
    case "letter":
      return "a letter";
    case "journey":
      return "a journey";
    case "study":
      return "study notes";
    case "code":
      return "code";
    case "story":
      return "a story";
    case "sparks":
      return "sparks";
  }
}

export function isFormId(value: unknown): value is FormId {
  return typeof value === "string" && (FORM_IDS as readonly string[]).includes(value);
}
