import type { FormId } from "./forms.ts";

export type Sample = {
  key: string;
  title: string;
  body: string;
  expect: FormId;
  /** Fixed so server and client render the same notebook. */
  updatedAt: number;
  checked?: string[];
};

const day = (iso: string) => Date.parse(iso);

export const SAMPLES: Sample[] = [
  {
    key: "sums",
    expect: "study",
    updatedAt: day("2026-04-02T18:00:00Z"),
    title: "Workshop sums",
    body: `Tip: eighteen percent of a forty-eight dollar bill, figured before anyone reaches for a phone.

48 * 0.18 = 8.64

Sine: the height of a thirty-degree angle, the way a workshop measures it, in degrees.

sin(30) = 0.5

Diagonal: corner to corner across a room that is three by four.

sqrt(3^2 + 4^2) = 5

Logarithm: how many tens are hiding inside a thousand.

log(1000) = 3

Formula: a line finishes itself only when it is actually an expression. A sentence with an equals sign is left alone.`,
  },
  {
    key: "cells",
    expect: "code",
    updatedAt: day("2026-04-01T11:20:00Z"),
    title: "cells.py",
    body: `# %% [markdown]
# Split a starter into two jars and print each share.

# %%
import math

def split(grams, jars=2):
    """Return the grams that belong in each jar."""
    if jars < 1:
        return grams
    return math.floor(grams / jars)

class Jar:
    def __init__(self, grams):
        self.grams = grams

print(split(200))`,
  },
  {
    key: "orders",
    expect: "code",
    updatedAt: day("2026-03-31T09:40:00Z"),
    title: "open-orders.sql",
    body: `SELECT id, table_no, total, opened_at FROM orders WHERE status = 'open' ORDER BY total DESC;

SELECT id, name, party_size FROM guests WHERE seated = 0 ORDER BY name;

INSERT INTO orders (table_no, total, status) VALUES (4, 48, 'open');`,
  },
  {
    key: "chili",
    expect: "recipe",
    updatedAt: day("2026-03-18T19:00:00Z"),
    title: "Weeknight chili",
    body: `Ingredients
1 tbsp olive oil
1 onion, diced
3 cloves garlic
400 g crushed tomatoes
2 tsp chili powder
1 tsp ground cumin
400 g beans, drained
Salt, to taste

Method
1. Warm the oil in a skillet and soften the onion, about 6 minutes.
2. Stir in the garlic and spices for 1 minute, until the kitchen smells right.
3. Add the tomatoes and beans. Simmer 25 minutes.
4. Season, then eat it over rice with whatever herbs are still alive.

Scale
Friends staying over means twice the tomatoes.
2 * 400 = 800`,
  },
  {
    key: "sync",
    expect: "minutes",
    updatedAt: day("2026-03-17T15:00:00Z"),
    title: "Monday product sync",
    body: `Attendees: Mira, Owen, Jules
Agenda: launch checklist and blockers

Decisions
- We decided to ship the empty state on Thursday.
- The pricing page stays as written.

Action items
- Mira: rewrite the invite email by Wednesday.
- Owen: confirm the domain. ETA Friday.
- Jules: file the blocker on search.

Next steps
Standup tomorrow, same time. No new agenda unless the blocker moves.`,
  },
  {
    key: "verse",
    expect: "verse",
    updatedAt: day("2026-03-16T22:30:00Z"),
    title: "Kitchen at midnight",
    body: `The kettle ticks itself quiet.

A spoon left in the bowl
holds the shape of a Tuesday.

Nobody turns the lamp on.
The window does enough.

Somewhere a bus sighs
and the basil leans toward it.`,
  },
  {
    key: "letter",
    expect: "letter",
    updatedAt: day("2026-03-15T11:00:00Z"),
    title: "To Nia",
    body: `Dear Nia,

The fig tree finally did something. I kept the first one for you, which is either generous or superstitious. Come by Sunday if the trains aren't being theatrical.

I'll make the chicken you liked and we can sit in the yard until the neighbors' radio gives up.

Yours,
Sam`,
  },
  {
    key: "lisbon",
    expect: "journey",
    updatedAt: day("2026-03-14T09:00:00Z"),
    title: "Saturday in Lisbon",
    body: `Day 1
08:10 Flight lands. Airport metro toward Baixa.
09:30 Drop the bags at the hotel.
11:00 Pastéis, then a slow walk to the river.
13:30 Lunch in Alfama. Reservation under Sam.
16:00 Train out to Belém before the light thins.
21:00 Fado, if we are not already asleep.`,
  },
  {
    key: "journal",
    expect: "journal",
    updatedAt: day("2026-03-13T21:10:00Z"),
    title: "Rain on the way home",
    body: `Today I left late and the street was already shining. I felt quieter than I have all week. My coat smelled like the train. I noticed the bakery was still open and I didn't go in, which I immediately regretted. Tonight I just want the lamp and something that isn't a screen. I hope tomorrow moves slower than I do.`,
  },
  {
    key: "market",
    expect: "list",
    updatedAt: day("2026-03-12T08:40:00Z"),
    title: "Market run",
    checked: ["sourdough"],
    body: `- sourdough
- eggs
- spinach
- lemons
- feta
- olive oil
- toothpaste
- batteries
- flowers, if they look decent`,
  },
  {
    key: "yeast",
    expect: "study",
    updatedAt: day("2026-03-11T16:20:00Z"),
    title: "How yeast works",
    body: `Definition: yeast is a single-celled fungus that eats sugar and exhales carbon dioxide.

Fermentation: the conversion of sugar into gas and alcohol when oxygen is scarce.

Proofing: the rest that lets dough rise before it meets heat.

Concept: salt slows the cells, warmth speeds them, and a tired starter needs a feeding.

For example, a drafty kitchen is the usual reason a loaf looks shy. In other words, the dough was cold, not lazy.`,
  },
  {
    key: "ferry",
    expect: "story",
    updatedAt: day("2026-03-10T18:00:00Z"),
    title: "The last ferry",
    body: `The horn sounded once, then thought better of it. Mara stood with the ticket in her coat and watched the ramp begin to lift.

"You're late," the deckhand said, not unkindly.

"I'm exactly on time for the wrong boat," she said.

He looked at the schedule, then at the weather, and waved her through anyway. The city unstitched itself from the dock one light at a time.`,
  },
  {
    key: "sparks",
    expect: "sparks",
    updatedAt: day("2026-03-09T13:15:00Z"),
    title: "Names for the studio",
    body: `What if it isn't a studio?
A smaller sign
Could we share the lease?
Idea: classes on Thursdays only
Maybe just the window
Who is it actually for?
What if we open at dusk?
North light, nothing else`,
  },
  {
    key: "debounce",
    expect: "code",
    updatedAt: day("2026-03-08T10:05:00Z"),
    title: "debounce.ts",
    body: `export function debounce(fn, wait = 280) {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}`,
  },
];
