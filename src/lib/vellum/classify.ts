import { FORM_META, type FormId, type ShapedId } from "./forms.ts";

export type Reading = {
  form: FormId;
  score: number;
  reason: string;
  scores: Record<ShapedId, number>;
};

const ORDER: ShapedId[] = [
  "code",
  "letter",
  "recipe",
  "minutes",
  "journey",
  "study",
  "list",
  "verse",
  "story",
  "journal",
  "sparks",
];

function emptyScores(): Record<ShapedId, number> {
  return {
    code: 0,
    letter: 0,
    recipe: 0,
    minutes: 0,
    journey: 0,
    study: 0,
    list: 0,
    verse: 0,
    story: 0,
    journal: 0,
    sparks: 0,
  };
}

function tally(text: string, re: RegExp): number {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  return [...text.matchAll(new RegExp(re.source, flags))].length;
}

function plain(scores: Record<ShapedId, number>, words = 0): Reading {
  return {
    form: "plain",
    score: 0,
    reason: words >= 40 ? "A page of writing." : FORM_META.plain.reason,
    scores,
  };
}

/**
 * Read a note and decide what kind of page it wants to be.
 * Pure and synchronous so it can run on every keystroke.
 */
export function classify(text: string): Reading {
  const raw = text.replace(/\r\n/g, "\n");
  const scores = emptyScores();
  const trimmed = raw.trim();
  const words = trimmed.length ? trimmed.split(/\s+/) : [];
  const wc = words.length;
  if (wc < 2) return plain(scores);

  const lines = raw.split("\n");
  const filled = lines.map((line) => line.trim()).filter(Boolean);
  const n = filled.length;
  const lower = raw.toLowerCase();

  const codeKw = tally(
    raw,
    /\b(function|const|let|var|import|export|return|class|def|async|await|interface|elif|lambda|SELECT|INSERT|print|console)\b/,
  );
  const codePunct = tally(raw, /[{};]|=>|<\/|\/>|::/);
  const fences = tally(raw, /```/);
  const indented = filled.filter((line) => /^\s{2,}\S/.test(line) || line.startsWith("\t")).length;
  const statement = filled.some((line) =>
    /^(?:print|console\.log|puts|echo|printf|println)\s*\(/.test(line) ||
    /^(?:def|class|function|const|let|var|import|from|SELECT|INSERT)\b/.test(line),
  );
  scores.code =
    fences * 6 + codeKw * 1.35 + Math.min(codePunct, 14) * 0.4 + indented * 0.35;
  if (codeKw >= 2 && codePunct >= 2) scores.code += 3;
  if (statement) scores.code += 6;

  const dear =
    /^(?:dear)\s+\S+/im.test(trimmed) ||
    /^(?:hello|hi)\s+\S+,/im.test(trimmed) ||
    (/^(?:hello|hi)\s+[A-Z][\w'.-]*/m.test(raw) &&
      /\b(sincerely|regards|warmly|cheers|yours|best wishes|talk soon|with love|all the best)\b/i.test(raw));
  const close = /\b(sincerely|regards|warmly|cheers|yours|best wishes|talk soon|with love|all the best)\b/i.test(
    raw,
  );
  if (dear) scores.letter += 6;
  if (close) scores.letter += 4;
  if (dear && close) scores.letter += 3;

  const units = tally(
    raw,
    /\b\d+(?:[./]\d+)?\s*(?:cups?|tbsp|tsp|teaspoons?|tablespoons?|grams?|kg|ml|oz|ounces?|lbs?|pounds?|cloves?|pinches?)\b/i,
  );
  const cook = tally(
    raw,
    /\b(preheat|bake|simmer|saut[eé]|chop|dice|whisk|roast|oven|boil|fry|garnish|season|stir|fold|knead|dough|marinate|broil|skillet|saucepan|ingredients|method|directions)\b/i,
  );
  const temps = tally(raw, /\b\d{2,3}\s*°\s*[fc]?\b|\b\d{2,3}\s*degrees\b/i);
  scores.recipe = units * 1.55 + cook * 1.05 + temps * 1.4;
  if (/\bingredients\b/i.test(raw) && (units >= 1 || cook >= 1)) scores.recipe += 3;

  const meet = tally(
    raw,
    /\b(agenda|attendees|action items?|standup|stand-up|sync|minutes|blockers?|follow[- ]?ups?|decisions?|next steps|okr)\b/i,
  );
  const decided = tally(
    raw,
    /\b(we decided|we agreed|decision:|action:|todo:|assigned to|eta)\b|@\w+/i,
  );
  scores.minutes = meet * 1.7 + decided * 1.5;
  if (/\b(meeting|standup|stand-up|sync)\b/i.test(raw) && n >= 3) scores.minutes += 2;

  const travel = tally(
    raw,
    /\b(itinerary|flight|hotel|airport|depart|arrive|arrival|departure|check-?in|museum|train|platform|metro|ferry|airbnb|reservation)\b/i,
  );
  const times = tally(raw, /\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/i);
  const days = tally(raw, /\bday\s+\d+\b/i);
  scores.journey = travel * 1.65 + days * 2.1 + (times >= 3 ? 3.2 : times >= 2 ? 1.4 : 0);
  if (travel >= 2 && times >= 2) scores.journey += 2;

  const studyKw = tally(
    raw,
    /\b(definition|theorem|lemma|means that|defined as|chapter|formula|hypothesis|in other words|for example|concept)\b|\b(?:e\.g\.|i\.e\.)/i,
  );
  const defs = filled.filter(
    (line) => /^.{2,48}?\s*[:—–-]\s+.{8,}$/.test(line) || /^#{1,3}\s+\S/.test(line),
  ).length;
  scores.study = studyKw * 1.55 + defs * 1.25;
  if (defs >= 3 && studyKw >= 1) scores.study += 2.2;

  if (n >= 3) {
    const bullets = filled.filter((line) => /^(?:[-*•]|\[\s?[x ]?\])\s+\S/i.test(line)).length;
    const short = filled.filter((line) => line.length <= 42).length;
    const shop = tally(
      raw,
      /\b(buy|milk|eggs|bread|grocery|groceries|pack|toothpaste|laundry|market|bananas|spinach|batteries)\b/i,
    );
    const periods = tally(raw, /[.!?](?:\s|$)/);
    const shortRatio = short / n;
    scores.list =
      bullets * 1.45 +
      shop * 1.15 +
      (shortRatio > 0.72 ? 3.4 : shortRatio > 0.55 ? 1.4 : 0);
    if (bullets / n > 0.55 && n >= 4) scores.list += 2.6;
    if (periods <= 1 && shortRatio > 0.7 && n >= 4) scores.list += 1.8;
    const brief = filled.filter((line) => line.split(/\s+/).length <= 2).length;
    if (brief / n >= 0.6 && n >= 4 && periods <= 1) scores.list += 2.6;
  }

  if (n >= 4) {
    const avg = filled.reduce((sum, line) => sum + line.length, 0) / n;
    const blanks = lines.filter((line) => !line.trim()).length;
    const longLines = filled.filter((line) => line.length > 68).length;
    const endPunct = filled.filter((line) => /[.!?]$/.test(line)).length;
    if (avg < 50 && longLines <= 1) {
      scores.verse =
        (avg < 38 ? 3.6 : 2) + (blanks >= 1 ? 2.1 : 0) + (endPunct / n < 0.4 ? 1.8 : 0);
      if (blanks >= 2 && avg < 42) scores.verse += 1.6;
    }
  }

  const dialogue = tally(raw, /[“"][^"\n]{6,}[”"]/);
  const narrative = tally(
    raw,
    /\b(said|asked|whispered|walked|looked|turned|smiled|murmured|replied|shouted)\b/i,
  );
  const avgLen = n ? filled.reduce((sum, line) => sum + line.length, 0) / n : 0;
  scores.story = dialogue * 2.3 + narrative * 1.05 + (avgLen > 64 && wc > 36 ? 2.2 : 0);
  if (dialogue >= 2 && narrative >= 1) scores.story += 2;

  const fp = tally(
    lower,
    /\b(i'm|i’ve|i've|i am|i was|i feel|i felt|today|tonight|this morning|yesterday|my|me)\b/,
  );
  const feel = tally(
    raw,
    /\b(grateful|tired|quiet|anxious|happy|sad|hope|miss|realized|noticed|lonely|calm|angry|proud|regret)\b/i,
  );
  scores.journal = (wc > 0 ? Math.min(fp / wc, 0.45) * 16 : 0) + feel * 1.15;
  if (/\b(dear diary|today i|this morning i|i woke|i felt)\b/i.test(raw)) scores.journal += 3;
  if (fp >= 4) scores.journal += 1.4;

  if (n >= 3) {
    const questions = filled.filter((line) => /\?\s*$/.test(line)).length;
    const ideaKw = tally(raw, /\b(what if|idea:|maybe|brainstorm|could we)\b/i);
    const qRatio = questions / n;
    const frag =
      filled.filter((line) => line.length < 52 && !/[.]$/.test(line)).length / n;
    scores.sparks =
      ideaKw * 1.7 + (qRatio > 0.4 ? 3.6 : qRatio > 0.25 ? 1.8 : 0);
    if (frag > 0.7 && ideaKw >= 1 && n >= 4) scores.sparks += 2.2;
  }

  if (scores.recipe >= 6) {
    scores.list *= 0.3;
    scores.verse *= 0.2;
    scores.sparks *= 0.25;
    scores.study *= 0.55;
  }
  if (scores.code >= 6) {
    scores.verse *= 0.15;
    scores.list *= 0.25;
    scores.study *= 0.35;
    scores.sparks *= 0.2;
    scores.journal *= 0.4;
  }
  if (scores.minutes >= 6) {
    scores.list *= 0.4;
    scores.sparks *= 0.35;
    scores.study *= 0.45;
    scores.journey *= 0.7;
  }
  if (scores.letter >= 7) {
    scores.journal *= 0.4;
    scores.story *= 0.45;
  }
  if (scores.journey >= 6) {
    scores.list *= 0.45;
    scores.minutes *= 0.5;
    scores.verse *= 0.4;
  }
  if (scores.story >= 6) {
    scores.journal *= 0.5;
    scores.verse *= 0.35;
  }
  if (scores.journal >= 6) {
    scores.story *= 0.65;
    scores.sparks *= 0.4;
    scores.verse *= 0.55;
  }
  if (scores.verse >= 6) {
    scores.list *= 0.4;
    scores.sparks *= 0.35;
    scores.journal *= 0.55;
  }
  if (scores.study >= 6) {
    scores.list *= 0.45;
    scores.sparks *= 0.4;
    scores.recipe *= 0.55;
  }
  if (scores.sparks >= 6) {
    scores.list *= 0.45;
    scores.verse *= 0.55;
  }
  if (scores.list >= 6) {
    scores.verse *= 0.45;
    scores.sparks *= 0.5;
  }

  const sections = filled.filter((line) => /^\d{1,2}[.)]\s+\S/.test(line.trim())).length;
  if (sections >= 2 && meet < 2) {
    scores.minutes *= 0.2;
    scores.list *= 0.45;
    scores.verse *= 0.35;
    if (dialogue < 2) scores.story *= 0.45;
  }

  let best: FormId = "plain";
  let bestScore = 0;
  for (const id of ORDER) {
    const score = scores[id];
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }

  const threshold = 4.25;
  if (bestScore < threshold) return plain(scores, wc);
  if (wc < 8 && bestScore < 6) return plain(scores, wc);

  return {
    form: best,
    score: bestScore,
    reason: FORM_META[best].reason,
    scores,
  };
}
