import type { FormId } from "./forms.ts";
import { filledLines, lineKey, wordCount } from "./text.ts";

export type FoundItem = {
  id: string;
  text: string;
  detail?: string;
  lineKey?: string;
  done?: boolean;
};

export type FoundGroup = {
  title: string;
  items: FoundItem[];
};

export type ReadingCard = {
  stats: { label: string; value: string }[];
  groups: FoundGroup[];
  aside?: string;
};

const QTY =
  /\b\d+(?:[./]\d+)?\s*(?:cups?|tbsp|tsp|teaspoons?|tablespoons?|grams?|kg|ml|oz|ounces?|lbs?|pounds?|cloves?|pinches?)\b/i;

function stat(label: string, value: string): { label: string; value: string } {
  return { label, value };
}

function stripBullet(line: string): string {
  return line
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/^\[[ xX]\]\s+/, "")
    .trim();
}

export function extract(form: FormId, title: string, body: string, checked: readonly string[]): ReadingCard {
  const text = `${title}\n${body}`.trim();
  const words = wordCount(text);
  const done = new Set(checked);

  switch (form) {
    case "recipe":
      return recipeCard(body, words);
    case "minutes":
      return minutesCard(body, words);
    case "list":
      return listCard(body, done, words);
    case "verse":
      return verseCard(body, words);
    case "letter":
      return letterCard(body, words);
    case "journey":
      return journeyCard(body, words);
    case "study":
      return studyCard(body, words);
    case "code":
      return codeCard(body, words);
    case "story":
      return storyCard(body, words);
    case "journal":
      return journalCard(body, words);
    case "sparks":
      return sparksCard(body, words);
    default:
      return {
        stats: [stat("Words", String(words))],
        groups: [],
        aside: words < 12 ? "A little more, and a shape will offer itself." : "Nothing is insisting yet. Keep going, or hold a shape yourself.",
      };
  }
}

function recipeCard(body: string, words: number): ReadingCard {
  const lines = filledLines(body);
  let mode: "any" | "ing" | "method" = "any";
  const ingredients: FoundItem[] = [];
  const steps: FoundItem[] = [];

  for (const line of lines) {
    const label = line.replace(/:$/, "").toLowerCase();
    if (/^(ingredients|you(?:'|’)ll need)$/.test(label)) {
      mode = "ing";
      continue;
    }
    if (/^(method|directions|steps|instructions)$/.test(label)) {
      mode = "method";
      continue;
    }
    const text = stripBullet(line);
    if (!text) continue;
    if (mode === "method" || /^\d+[.)]\s+/.test(line)) {
      steps.push({ id: `s-${steps.length}`, text });
    } else if (mode === "ing" || QTY.test(line)) {
      ingredients.push({ id: `i-${ingredients.length}`, text });
    }
  }

  const clocks =
    body.match(/\b\d+\s*(?:min|mins|minutes|hrs|hours)\b|\b\d{1,2}:\d{2}\b|\b\d{2,3}\s*°\s*[fc]?\b/gi) ??
    [];

  return {
    stats: [
      stat("Ingredients", String(ingredients.length)),
      stat("Steps", String(steps.length)),
      stat("Words", String(words)),
    ],
    groups: [
      { title: "Ingredients", items: ingredients },
      { title: "Method", items: steps },
    ].filter((group) => group.items.length > 0),
    aside: clocks.length ? clocks.slice(0, 4).join(" · ") : undefined,
  };
}

function minutesCard(body: string, words: number): ReadingCard {
  const lines = filledLines(body);
  const decisions: FoundItem[] = [];
  const actions: FoundItem[] = [];
  const people = new Set<string>();

  const attendeeLine = lines.find((line) => /^attendees?\s*:/i.test(line));
  if (attendeeLine) {
    for (const name of attendeeLine.split(":").slice(1).join(":").split(/,| and /)) {
      const clean = name.trim();
      if (clean) people.add(clean);
    }
  }

  for (const line of lines) {
    const text = stripBullet(line);
    if (!text || /^attendees?\s*:/i.test(line)) continue;
    if (/^(agenda|decisions|action items|next steps|attendees|ingredients|method)$/i.test(text.replace(/:.*/, "").trim())) {
      continue;
    }
    if (/\b(we decided|we agreed)\b/i.test(line) || /stays as written/i.test(line)) {
      decisions.push({ id: `d-${decisions.length}`, text });
      continue;
    }
    if (/:\s+\S/.test(text) && /^[A-Z][\w'-]{1,20}:/.test(text)) {
      const owner = text.split(":")[0]?.trim();
      if (owner) people.add(owner);
      actions.push({ id: `a-${actions.length}`, text, detail: owner });
      continue;
    }
    if (/\b(todo|action|follow up|next step|blocker)\b/i.test(line)) {
      actions.push({ id: `a-${actions.length}`, text });
    }
  }

  return {
    stats: [
      stat("People", String(people.size)),
      stat("Decisions", String(decisions.length)),
      stat("Actions", String(actions.length)),
    ],
    groups: [
      { title: "Decisions", items: decisions },
      { title: "Actions", items: actions },
    ].filter((group) => group.items.length > 0),
    aside: people.size ? [...people].join(" · ") : `${words} words`,
  };
}

function listCard(body: string, done: Set<string>, words: number): ReadingCard {
  const items = filledLines(body).map((line, index) => {
    const text = stripBullet(line);
    const key = lineKey(line);
    return {
      id: `l-${index}`,
      text,
      lineKey: key,
      done: done.has(key),
    };
  });
  const finished = items.filter((item) => item.done).length;
  return {
    stats: [
      stat("Items", String(items.length)),
      stat("Done", String(finished)),
      stat("Left", String(items.length - finished)),
    ],
    groups: items.length ? [{ title: "Tick them off", items }] : [],
    aside: words ? undefined : "One thing per line.",
  };
}

function verseCard(body: string, words: number): ReadingCard {
  const stanzas = body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((stanza) => stanza.trim())
    .filter(Boolean);
  const lines = filledLines(body);
  return {
    stats: [
      stat("Stanzas", String(stanzas.length)),
      stat("Lines", String(lines.length)),
      stat("Words", String(words)),
    ],
    groups: stanzas.slice(0, 4).map((stanza, index) => ({
      title: stanzas.length > 1 ? `Stanza ${index + 1}` : "The poem",
      items: [{ id: `v-${index}`, text: stanza }],
    })),
  };
}

function letterCard(body: string, words: number): ReadingCard {
  const lines = filledLines(body);
  const greet = lines.find((line) => /^(dear|hello|hi)\s+\S+/i.test(line));
  const close = lines.find((line) =>
    /^(yours|sincerely|warmly|cheers|regards|best|love)\b/i.test(line),
  );
  const addressee = greet?.replace(/^(dear|hello|hi)\s+/i, "").replace(/,$/, "");
  return {
    stats: [
      stat("To", addressee || "—"),
      stat("Words", String(words)),
      stat("Close", close?.replace(/,$/, "") || "—"),
    ],
    groups: [],
    aside: greet ? `Opens with “${greet.replace(/,$/, "")}”.` : "It doesn't have a greeting yet.",
  };
}

function journeyCard(body: string, words: number): ReadingCard {
  const items: FoundItem[] = [];
  for (const line of filledLines(body)) {
    if (/^day\s+\d+$/i.test(line)) continue;
    const time = line.match(/\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/i)?.[0];
    if (!time) continue;
    const text = line.replace(time, "").replace(/^[\s\-–—]+/, "").trim();
    items.push({
      id: `j-${items.length}`,
      text: text || line,
      detail: time,
    });
  }
  return {
    stats: [stat("Stops", String(items.length)), stat("Words", String(words))],
    groups: items.length ? [{ title: "In order", items }] : [],
    aside: items.length ? undefined : "Add a time and the day will line up.",
  };
}

function studyCard(body: string, words: number): ReadingCard {
  const terms: FoundItem[] = [];
  for (const line of filledLines(body)) {
    const match = line.match(/^(.{2,48}?)\s*[:—–-]\s+(.{8,})$/);
    if (!match) continue;
    const term = match[1]?.trim();
    const meaning = match[2]?.trim();
    if (!term || !meaning) continue;
    if (/^\d/.test(term)) continue;
    terms.push({ id: `t-${terms.length}`, text: meaning, detail: term });
  }
  return {
    stats: [stat("Terms", String(terms.length)), stat("Words", String(words))],
    groups: terms.length ? [{ title: "Terms", items: terms }] : [],
    aside: terms.length ? undefined : "Write “term: what it means” and it will lift out.",
  };
}

function codeCard(body: string, words: number): ReadingCard {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const fns = [...body.matchAll(/\b(?:function|class|def)\s+([A-Za-z_]\w*)/g)].map((match) => match[1]);
  const exports = tallyExports(body);
  return {
    stats: [
      stat("Lines", String(lines.length)),
      stat("Functions", String(fns.length)),
      stat("Words", String(words)),
    ],
    groups: fns.length
      ? [{ title: "Named", items: fns.map((name, index) => ({ id: `f-${index}`, text: name ?? "" })) }]
      : [],
    aside: exports ? "Has an export." : "Not exported.",
  };
}

function tallyExports(body: string): boolean {
  return /\bexport\b/.test(body);
}

function storyCard(body: string, words: number): ReadingCard {
  const quotes = [...body.matchAll(/[“"]([^"\n]{6,})[”"]/g)].map((match) => match[1] ?? "");
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    stats: [
      stat("Paragraphs", String(paragraphs.length)),
      stat("Spoken", String(quotes.length)),
      stat("Words", String(words)),
    ],
    groups: quotes.length
      ? [
          {
            title: "Spoken",
            items: quotes.map((quote, index) => ({ id: `q-${index}`, text: quote })),
          },
        ]
      : [],
    aside: words > 40 ? "About a minute, if read aloud slowly." : undefined,
  };
}

function journalCard(body: string, words: number): ReadingCard {
  const mood =
    body.match(
      /\b(grateful|tired|quiet|anxious|happy|sad|hope|miss|lonely|calm|angry|proud|regret\w*)\b/gi,
    ) ?? [];
  const unique = [...new Set(mood.map((word) => word.toLowerCase()))];
  return {
    stats: [stat("Words", String(words)), stat("Mood", String(unique.length))],
    groups: unique.length
      ? [
          {
            title: "Words it keeps using",
            items: unique.map((word, index) => ({ id: `m-${index}`, text: word })),
          },
        ]
      : [],
    aside: "A private page. It stays on this device.",
  };
}

function sparksCard(body: string, words: number): ReadingCard {
  const items = filledLines(body).map((line, index) => ({
    id: `p-${index}`,
    text: stripBullet(line),
  }));
  const questions = items.filter((item) => item.text.endsWith("?")).length;
  return {
    stats: [stat("Sparks", String(items.length)), stat("Questions", String(questions)), stat("Words", String(words))],
    groups: items.length ? [{ title: "Loose", items }] : [],
  };
}
