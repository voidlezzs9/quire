import { Plus, Search } from "lucide-react";
import { noteTitle, useNotes, type Note } from "@/lib/vellum/store";

const WHEN = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

type RailProps = {
  onNavigate?: () => void;
  onCreate?: () => void;
};

export function Rail({ onNavigate, onCreate }: RailProps) {
  const notes = useNotes((state) => state.notes);
  const activeId = useNotes((state) => state.activeId);
  const query = useNotes((state) => state.query);
  const setQuery = useNotes((state) => state.setQuery);
  const select = useNotes((state) => state.select);
  const create = useNotes((state) => state.create);

  const needle = query.trim().toLowerCase();
  const visible = notes.filter((note) => {
    if (!needle) return true;
    return `${note.title}\n${note.body}`.toLowerCase().includes(needle);
  });
  const yours = visible.filter((note) => !note.example).sort((a, b) => b.updatedAt - a.updatedAt);
  const samples = visible.filter((note) => note.example).sort((a, b) => b.updatedAt - a.updatedAt);

  function open(id: string) {
    select(id);
    onNavigate?.();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 pt-5 pb-3">
        <p className="font-serif text-3xl leading-none text-ink">Quire</p>
        <p className="mt-2 text-sm leading-5 text-muted">The page reads with you.</p>
        <button
          type="button"
          className="tap mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper"
          onClick={() => {
            onCreate?.();
            create();
            onNavigate?.();
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          New note
        </button>
        <label className="mt-3 flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper px-3">
          <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search notes"
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {visible.length === 0 ? <p className="px-2 py-6 text-sm text-muted">Nothing under that name.</p> : null}
        <NoteGroup label="Yours" notes={yours} activeId={activeId} onOpen={open} />
        <NoteGroup label="Samples" notes={samples} activeId={activeId} onOpen={open} />
      </div>
    </div>
  );
}

function NoteGroup({
  label,
  notes,
  activeId,
  onOpen,
}: {
  label: string;
  notes: Note[];
  activeId: string;
  onOpen: (id: string) => void;
}) {
  if (!notes.length) return null;
  return (
    <section className="mt-4">
      <h2 className="px-2 text-sm text-muted">{label}</h2>
      <ul className="mt-1">
        {notes.map((note) => {
          const active = note.id === activeId;
          const preview = note.body
            .split("\n")
            .map((line) => line.trim())
            .find((line) => line && line !== note.title.trim());
          return (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => onOpen(note.id)}
                aria-current={active ? "page" : undefined}
                aria-label={`${noteTitle(note)}, ${WHEN.format(note.updatedAt)}`}
                className={
                  active
                    ? "mt-1 flex min-h-11 w-full flex-col items-start rounded-xl bg-copper-soft px-3 py-2 text-left"
                    : "mt-1 flex min-h-11 w-full flex-col items-start rounded-xl px-3 py-2 text-left hover:bg-paper"
                }
              >
                <span className="w-full truncate text-sm font-medium text-ink">{noteTitle(note)}</span>
                <span className="mt-0.5 flex w-full items-baseline gap-2 text-sm text-muted">
                  <span className="shrink-0 tabular-nums">{WHEN.format(note.updatedAt)}</span>
                  <span className="truncate">{preview ?? "Empty page"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
