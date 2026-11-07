import { useState } from "react";
import { Smile } from "lucide-react";
import { GLYPH_PACKS } from "@/lib/vellum/glyphs";

export function Stickers({ onInsert }: { onInsert: (glyph: string) => void }) {
  const [open, setOpen] = useState(false);
  const [packId, setPackId] = useState(GLYPH_PACKS[0]?.id ?? "faces");
  const pack = GLYPH_PACKS.find((item) => item.id === packId) ?? GLYPH_PACKS[0];

  return (
    <div className="mt-6">
      <button
        type="button"
        aria-expanded={open}
        className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm text-ink-soft"
        onClick={() => setOpen((value) => !value)}
      >
        <Smile className="size-4" />
        Stickers
      </button>
      {open && pack ? (
        <div className="mt-1">
          <div className="chips" role="tablist" aria-label="Sticker packs">
            {GLYPH_PACKS.map((item) => {
              const selected = item.id === pack.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={
                    selected
                      ? "tap min-h-11 shrink-0 rounded-full bg-ink px-3 text-sm text-paper"
                      : "tap min-h-11 shrink-0 rounded-full bg-bone px-3 text-sm text-ink-soft"
                  }
                  onClick={() => setPackId(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="chips mt-2 pb-1" aria-label={pack.label}>
            {pack.items.map((item) => (
              <button
                key={`${pack.id}-${item.name}`}
                type="button"
                title={item.name}
                aria-label={item.name}
                className={`tap flex min-h-11 shrink-0 items-center rounded-xl bg-bone px-2.5 font-sans ${item.glyph.length > 2 ? "text-sm" : "text-xl"}`}
                onClick={() => onInsert(item.glyph)}
              >
                {item.glyph}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
