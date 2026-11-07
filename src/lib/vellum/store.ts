import { create } from "zustand";
import { isFormId, type FormId } from "./forms.ts";
import { SAMPLES } from "./samples.ts";

export type Note = {
  id: string;
  title: string;
  body: string;
  pinned: FormId | null;
  checked: string[];
  example: boolean;
  createdAt: number;
  updatedAt: number;
};

type NotebookSave = {
  notes: Note[];
  activeId: string;
  /** Sample ids the user removed. Those pages are not seeded again. */
  dismissed: string[];
  /** Sample ids this browser has already been shown, so a later sample can still arrive. */
  introduced: string[];
};

type NotesState = NotebookSave & {
  query: string;
  ready: boolean;
  setQuery: (query: string) => void;
  select: (id: string) => void;
  create: () => void;
  importNote: (title: string, body: string) => string;
  update: (id: string, patch: Partial<Pick<Note, "title" | "body" | "pinned" | "checked">>) => void;
  toggleCheck: (id: string, key: string) => void;
  remove: (id: string) => void;
  hydrate: () => void;
};

const STORAGE_KEY = "quire.notes.v1";

export function seedNotes(): Note[] {
  return SAMPLES.map((sample) => ({
    id: `sample-${sample.key}`,
    title: sample.title,
    body: sample.body,
    pinned: null,
    checked: sample.checked ?? [],
    example: true,
    createdAt: sample.updatedAt,
    updatedAt: sample.updatedAt,
  }));
}

/** Refresh untouched samples and add ones this browser has not met. Dismissed samples stay gone. */
export function mergeWithSamples(stored: NotebookSave): NotebookSave {
  const fresh = seedNotes();
  const freshIds = new Set(fresh.map((note) => note.id));
  const dismissed = new Set(stored.dismissed);
  const byId = new Map(stored.notes.map((note) => [note.id, note]));
  const userNotes = stored.notes.filter((note) => !freshIds.has(note.id));
  const samples = fresh
    .filter((sample) => !dismissed.has(sample.id))
    .map((sample) => {
      const existing = byId.get(sample.id);
      if (!existing || existing.example) {
        const checked = existing?.checked.length ? existing.checked : sample.checked;
        return { ...sample, checked };
      }
      return existing;
    });
  const notes = [...userNotes, ...samples];
  const activeId = notes.some((note) => note.id === stored.activeId)
    ? stored.activeId
    : (notes[0]?.id ?? "");
  const introduced = [...new Set([...stored.introduced, ...fresh.map((sample) => sample.id)])];
  return { notes, activeId, dismissed: stored.dismissed, introduced };
}

function fallback(): NotebookSave {
  const notes = seedNotes();
  return {
    notes,
    activeId: notes[0]?.id ?? "",
    dismissed: [],
    introduced: notes.map((note) => note.id),
  };
}

function idList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((entry) => typeof entry === "string");
}

function sanitize(value: unknown): NotebookSave | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { notes?: unknown; activeId?: unknown; dismissed?: unknown; introduced?: unknown };
  if (!Array.isArray(record.notes)) return null;
  const notes: Note[] = [];
  for (const item of record.notes) {
    if (!item || typeof item !== "object") continue;
    const note = item as Partial<Note>;
    if (typeof note.id !== "string" || typeof note.title !== "string" || typeof note.body !== "string") {
      continue;
    }
    notes.push({
      id: note.id,
      title: note.title,
      body: note.body,
      pinned: isFormId(note.pinned) ? note.pinned : null,
      checked: Array.isArray(note.checked) ? note.checked.filter((entry) => typeof entry === "string") : [],
      example: Boolean(note.example),
      createdAt: typeof note.createdAt === "number" ? note.createdAt : Date.now(),
      updatedAt: typeof note.updatedAt === "number" ? note.updatedAt : Date.now(),
    });
  }
  if (!notes.length) return null;
  const activeId = typeof record.activeId === "string" && notes.some((note) => note.id === record.activeId)
    ? record.activeId
    : notes[0].id;
  const known = new Set(seedNotes().map((note) => note.id));
  const introduced = idList(record.introduced);
  const dismissed = idList(record.dismissed);
  return {
    notes,
    activeId,
    introduced: introduced ?? [...known],
    dismissed:
      dismissed ??
      [...known].filter((id) => !notes.some((note) => note.id === id)),
  };
}

const initial = fallback();

export const useNotes = create<NotesState>((set, get) => ({
  notes: initial.notes,
  activeId: initial.activeId,
  dismissed: initial.dismissed,
  introduced: initial.introduced,
  query: "",
  ready: false,
  setQuery: (query) => set({ query }),
  select: (id) => set({ activeId: id }),
  create: () => {
    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      body: "",
      pinned: null,
      checked: [],
      example: false,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ notes: [note, ...state.notes], activeId: note.id }));
  },
  importNote: (title, body) => {
    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      body,
      pinned: null,
      checked: [],
      example: false,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ notes: [note, ...state.notes], activeId: note.id }));
    return note.id;
  },
  update: (id, patch) => {
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== id) return note;
        const next = { ...note, ...patch, updatedAt: Date.now() };
        if (note.example && (patch.title !== undefined || patch.body !== undefined)) {
          next.example = false;
        }
        return next;
      }),
    }));
  },
  toggleCheck: (id, key) => {
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== id) return note;
        const has = note.checked.includes(key);
        return {
          ...note,
          checked: has ? note.checked.filter((entry) => entry !== key) : [...note.checked, key],
          updatedAt: Date.now(),
        };
      }),
    }));
  },
  remove: (id) => {
    set((state) => {
      const removed = state.notes.find((note) => note.id === id);
      const dismissed =
        removed?.id.startsWith("sample-") && !state.dismissed.includes(removed.id)
          ? [...state.dismissed, removed.id]
          : state.dismissed;
      const notes = state.notes.filter((note) => note.id !== id);
      if (!notes.length) {
        const blank = fallback();
        const fresh = blank.notes[0];
        if (!fresh) return { notes: [], activeId: "", dismissed, introduced: state.introduced };
        const now = Date.now();
        const note: Note = {
          ...fresh,
          id: crypto.randomUUID(),
          title: "",
          body: "",
          example: false,
          pinned: null,
          checked: [],
          createdAt: now,
          updatedAt: now,
        };
        return { notes: [note], activeId: note.id, dismissed, introduced: state.introduced };
      }
      const activeId = state.activeId === id ? notes[0].id : state.activeId;
      return { notes, activeId, dismissed, introduced: state.introduced };
    });
  },
  hydrate: () => {
    if (get().ready) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = sanitize(JSON.parse(raw));
        if (parsed) {
          set({ ...mergeWithSamples(parsed), ready: true });
          return;
        }
      }
    } catch {
      /* keep the seeded notebook */
    }
    set({ ready: true });
    try {
      const { notes, activeId, dismissed, introduced } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, activeId, dismissed, introduced }));
    } catch {
      /* private mode */
    }
  },
}));

if (typeof window !== "undefined") {
  useNotes.subscribe((state, previous) => {
    if (!state.ready) return;
    if (
      state.notes === previous.notes &&
      state.activeId === previous.activeId &&
      state.dismissed === previous.dismissed &&
      state.introduced === previous.introduced
    ) {
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          notes: state.notes,
          activeId: state.activeId,
          dismissed: state.dismissed,
          introduced: state.introduced,
        }),
      );
    } catch {
      /* ignore quota */
    }
  });
}

export function noteTitle(note: Note): string {
  const title = note.title.trim();
  if (title) return title;
  const line = note.body.split("\n").map((entry) => entry.trim()).find(Boolean);
  return line ? line.slice(0, 48) : "Untitled";
}
