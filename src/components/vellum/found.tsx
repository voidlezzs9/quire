import { Check } from "lucide-react";
import type { ReadingCard } from "@/lib/vellum/extract";

type FoundProps = {
  card: ReadingCard;
  onToggle: (key: string) => void;
};

export function Found({ card, onToggle }: FoundProps) {
  return (
    <div className="flex flex-col gap-6 px-5 py-6">
      <div>
        <p className="kicker">On the page</p>
        {card.aside ? <p className="mt-3 text-sm leading-6 text-ink-soft">{card.aside}</p> : null}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {card.stats.map((item) => (
          <div key={item.label} className="min-w-16">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-1 text-lg font-medium break-words text-ink tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
      {card.groups.map((group) => (
        <section key={group.title}>
          <h2 className="text-sm font-medium text-muted">{group.title}</h2>
          {group.title === "In order" ? (
            <ol className="stops mt-4">
              {group.items.map((item) => (
                <li key={item.id} className="stop">
                  {item.detail ? <p className="text-sm text-copper tabular-nums">{item.detail}</p> : null}
                  <p className="text-sm leading-6 text-ink">{item.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="mt-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.lineKey ? (
                    <button
                      type="button"
                      className="tap flex min-h-11 w-full items-start gap-3 rounded-lg py-2 text-left"
                      aria-pressed={Boolean(item.done)}
                      onClick={() => onToggle(item.lineKey ?? "")}
                    >
                      <span
                        className={
                          item.done
                            ? "mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-copper bg-copper text-paper"
                            : "mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-line bg-paper"
                        }
                        aria-hidden="true"
                      >
                        {item.done ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
                      </span>
                      <span className={item.done ? "text-sm leading-6 text-muted line-through" : "text-sm leading-6 text-ink"}>
                        {item.text}
                      </span>
                    </button>
                  ) : (
                    <p className="py-1.5 text-sm leading-6 whitespace-pre-wrap text-ink">
                      {item.detail ? <span className="text-copper">{item.detail}</span> : null}
                      {item.detail ? <span className="text-muted"> — </span> : null}
                      {item.text}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export function foundSummary(card: ReadingCard): string {
  return card.stats
    .slice(0, 2)
    .map((item) => `${item.value} ${item.label.toLowerCase()}`)
    .join(" · ");
}
