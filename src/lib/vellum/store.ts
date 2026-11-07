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

type NotesState = {
  notes: Note[];
  activeId: string;
  query: string;
  ready: boolean;
  setQuery: (query: string) => void;
  select: (id: string) => void;
  create: () => void;
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
    checked: [],
    example: true,
    createdAt: sample.updatedAt,
    updatedAt: sample.updatedAt,
  }));
}

function fallback(): { notes: Note[]; activeId: string } {
  const notes = seedNotes();
  return { notes, activeId: notes[0]?.id ?? "" };
}

function sanitize(value: unknown): { notes: Note[]; activeId: string } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { notes?: unknown; activeId?: unknown };
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
  return { notes, activeId };
}

const initial = fallback();

export const useNotes = create<NotesState>((set, get) => ({
  notes: initial.notes,
  activeId: initial.activeId,
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
      const notes = state.notes.filter((note) => note.id !== id);
      if (!notes.length) {
        const blank = fallback();
        const fresh = blank.notes[0];
        if (!fresh) return { notes: [], activeId: "" };
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
        return { notes: [note], activeId: note.id };
      }
      const activeId = state.activeId === id ? notes[0].id : state.activeId;
      return { notes, activeId };
    });
  },
  hydrate: () => {
    if (get().ready) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = sanitize(JSON.parse(raw));
        if (parsed) {
          set({ ...parsed, ready: true });
          return;
        }
      }
    } catch {
      /* keep the seeded notebook */
    }
    set({ ready: true });
    try {
      const { notes, activeId } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, activeId }));
    } catch {
      /* private mode */
    }
  },
}));

if (typeof window !== "undefined") {
  useNotes.subscribe((state, previous) => {
    if (!state.ready) return;
    if (state.notes === previous.notes && state.activeId === previous.activeId) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ notes: state.notes, activeId: state.activeId }),
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
