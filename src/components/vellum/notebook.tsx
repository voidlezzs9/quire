import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Check, Copy, Download, Menu, Pin, PinOff, Plus, Trash2, X } from "lucide-react";
import { classify, type Reading } from "@/lib/vellum/classify";
import { exportChoices, saveExport } from "@/lib/vellum/export";
import { extract } from "@/lib/vellum/extract";
import { asPhrase, CHIP_IDS, FORM_META, type FormId } from "@/lib/vellum/forms";
import { useNotes, type Note } from "@/lib/vellum/store";
import { wordCount } from "@/lib/vellum/text";
import { ProseEditor } from "@/components/vellum/editor";
import { Found, foundSummary } from "@/components/vellum/found";
import { Rail } from "@/components/vellum/rail";

type Scope = {
  note: Note;
  reading: Reading;
  form: FormId;
  listening: boolean;
};

const PageScope = createContext<Scope | null>(null);

function useScope(): Scope {
  const scope = useContext(PageScope);
  if (!scope) throw new Error("Page scope missing");
  return scope;
}

export function Notebook() {
  const hydrate = useNotes((state) => state.hydrate);
  const notes = useNotes((state) => state.notes);
  const activeId = useNotes((state) => state.activeId);
  const create = useNotes((state) => state.create);
  const note = notes.find((item) => item.id === activeId) ?? notes[0];

  const [railOpen, setRailOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const armFocus = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        armFocus.current = true;
        create();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [create]);

  useEffect(() => {
    if (!armFocus.current) return;
    armFocus.current = false;
    titleRef.current?.focus();
  }, [note?.id]);

  if (!note) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bone px-6 text-ink">
        <p className="font-serif text-3xl">Quire</p>
      </main>
    );
  }

  return (
    <FormScope note={note}>
      <div className="flex h-dvh overflow-hidden bg-bone text-ink">
        <h1 className="sr-only">Quire</h1>
        <aside className="hidden h-dvh w-72 shrink-0 flex-col border-r border-line md:flex">
          <Rail
            onCreate={() => {
              armFocus.current = true;
            }}
          />
        </aside>
        {railOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Close notebook"
              onClick={() => setRailOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-80 max-w-full flex-col bg-bone">
              <div className="flex justify-end px-2 pt-2">
                <IconButton label="Close" onClick={() => setRailOpen(false)}>
                  <X className="size-5" />
                </IconButton>
              </div>
              <Rail
                onNavigate={() => setRailOpen(false)}
                onCreate={() => {
                  armFocus.current = true;
                }}
              />
            </div>
          </div>
        ) : null}
        <section className="flex min-w-0 flex-1 flex-col">
          <SheetHeader
            onMenu={() => setRailOpen(true)}
            onNew={() => {
              armFocus.current = true;
              create();
            }}
          />
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto">
              <div className="px-4 pt-4 lg:hidden">
                <MobileReading onOpen={() => setReadingOpen(true)} />
              </div>
              <Page titleRef={titleRef} bodyRef={bodyRef} />
            </div>
            <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-line lg:block">
              <Reading />
            </aside>
          </div>
        </section>
        {readingOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Close reading"
              onClick={() => setReadingOpen(false)}
            />
            <div className="reading-sheet absolute inset-x-0 bottom-0 overflow-y-auto rounded-t-sheet bg-bone">
              <div className="flex justify-end px-2 pt-2">
                <IconButton label="Close" onClick={() => setReadingOpen(false)}>
                  <X className="size-5" />
                </IconButton>
              </div>
              <Reading />
            </div>
          </div>
        ) : null}
      </div>
    </FormScope>
  );
}

function FormScope({ note, children }: { note: Note; children: ReactNode }) {
  const reading = useMemo(
    () => classify(`${note.title}\n${note.body}`),
    [note.title, note.body],
  );
  const [settled, setSettled] = useState(reading.form);
  const seen = useRef(note.id);

  if (seen.current !== note.id) {
    seen.current = note.id;
    setSettled(note.pinned ?? reading.form);
  }

  useEffect(() => {
    if (note.pinned) return;
    const timer = window.setTimeout(() => setSettled(reading.form), 340);
    return () => window.clearTimeout(timer);
  }, [reading.form, note.id, note.pinned]);

  const form = note.pinned ?? settled;
  const listening = !note.pinned && settled !== reading.form;
  const value = useMemo(
    () => ({ note, reading, form, listening }),
    [note, reading, form, listening],
  );

  return <PageScope.Provider value={value}>{children}</PageScope.Provider>;
}

function SheetHeader({ onMenu, onNew }: { onMenu: () => void; onNew: () => void }) {
  const { note, reading, form, listening } = useScope();
  const update = useNotes((state) => state.update);
  const remove = useNotes((state) => state.remove);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const confirmFor = useRef(note.id);
  const choices = useMemo(
    () => exportChoices(form, note.title, note.body, note.checked),
    [form, note.title, note.body, note.checked],
  );

  if (confirmFor.current !== note.id) {
    confirmFor.current = note.id;
    if (confirming) setConfirming(false);
    if (copied) setCopied(false);
    if (saving) setSaving(false);
  }

  const phrase = asPhrase(form);

  function pin(next: FormId | null) {
    update(note.id, { pinned: next });
  }

  function copy() {
    const text = [note.title, note.body].filter(Boolean).join("\n\n");
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <header className="shrink-0 border-b border-line">
      <div className="flex items-center gap-1 px-3 pt-2 md:px-5">
        <IconButton label="Open notebook" className="md:hidden" onClick={onMenu}>
          <Menu className="size-5" />
        </IconButton>
        <p className="font-serif text-2xl leading-none md:hidden">Quire</p>
        <div className="ml-auto flex items-center">
          {confirming ? (
            <>
              <span className="pr-1 text-sm text-ink-soft">Delete?</span>
              <TextButton onClick={() => setConfirming(false)}>Keep</TextButton>
              <TextButton tone="copper" onClick={() => remove(note.id)}>
                Delete
              </TextButton>
            </>
          ) : (
            <>
              <TextButton
                label={note.pinned ? "Let the page choose" : "Keep this shape"}
                onClick={() => pin(note.pinned ? null : form)}
              >
                {note.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                <span className="hidden sm:inline">{note.pinned ? "Release" : "Hold"}</span>
              </TextButton>
              <TextButton label="Copy note" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </TextButton>
              <div className="relative">
                <TextButton label="Save note as a file" onClick={() => setSaving((open) => !open)}>
                  <Download className="size-4" />
                  <span className="hidden sm:inline">Save</span>
                </TextButton>
                {saving ? (
                  <div className="absolute right-0 z-20 mt-1 w-52 rounded-2xl border border-line bg-bone p-1 shadow-none" role="menu">
                    {choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        role="menuitem"
                        className="tap flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm"
                        onClick={() => {
                          saveExport(choice.file);
                          setSaving(false);
                        }}
                      >
                        <span>{choice.label}</span>
                        <span className="text-muted">{choice.ext}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <TextButton label="Delete note" onClick={() => setConfirming(true)}>
                <Trash2 className="size-4" />
              </TextButton>
              <IconButton label="New note" className="md:hidden" onClick={onNew}>
                <Plus className="size-5" />
              </IconButton>
            </>
          )}
        </div>
      </div>
      <p className="px-4 pt-1 text-sm leading-6 md:px-6" aria-live="polite">
        {listening ? <span className="listen-dot" aria-hidden="true" /> : null}
        {listening ? (
          <span>Listening. Still set as {phrase}.</span>
        ) : (
          <>
            <span className="text-copper">{note.pinned ? "Held" : "Reading"}</span>
            {` as ${phrase}. `}
            <span className="text-muted">{FORM_META[form].reason}</span>
            {note.pinned && reading.form !== note.pinned ? (
              <span className="text-muted"> Left alone, this would be {asPhrase(reading.form)}.</span>
            ) : null}
          </>
        )}
      </p>
      <div className="chips px-3 pt-2 pb-3 md:px-5" role="toolbar" aria-label="Page shape">
        <button
          type="button"
          aria-pressed={note.pinned === null}
          className={shapeClass(note.pinned === null ? "auto" : "idle")}
          onClick={() => pin(null)}
        >
          Auto
        </button>
        {CHIP_IDS.map((id) => {
          const pinned = note.pinned === id;
          const live = note.pinned === null && form === id;
          return (
            <button
              key={id}
              type="button"
              title={FORM_META[id].reason}
              aria-pressed={pinned || live}
              className={shapeClass(pinned ? "pin" : live ? "live" : "idle")}
              onClick={() => pin(pinned ? null : id)}
            >
              {FORM_META[id].label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

function shapeClass(kind: "auto" | "pin" | "live" | "idle"): string {
  const base = "tap min-h-11 shrink-0 rounded-full px-3 text-sm";
  if (kind === "auto") return `${base} bg-ink text-paper`;
  if (kind === "pin") return `${base} bg-copper text-paper`;
  if (kind === "live") return `${base} bg-copper-soft text-ink`;
  return `${base} bg-paper text-ink-soft`;
}

function Page({
  titleRef,
  bodyRef,
}: {
  titleRef: RefObject<HTMLInputElement | null>;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const { note, form } = useScope();
  const update = useNotes((state) => state.update);
  const notes = useNotes((state) => state.notes);
  const select = useNotes((state) => state.select);
  const meta = FORM_META[form];
  const empty = !note.title.trim() && !note.body.trim();
  const samples = notes.filter((item) => item.example).slice(0, 4);
  const words = wordCount(`${note.title}\n${note.body}`);

  return (
    <div className="px-4 py-5 md:px-8 md:py-8">
      <article className="sheet mx-auto w-full max-w-3xl px-5 py-7 sm:px-9 sm:py-10" data-form={form}>
        <div className="measure">
          <p className="sheet-kicker">{meta.kicker}</p>
          <input
            ref={titleRef}
            value={note.title}
            aria-label="Title"
            placeholder="Title"
            className="sheet-title mt-3"
            onChange={(event) => update(note.id, { title: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                bodyRef.current?.focus();
              }
            }}
          />
          <hr className="sheet-rule" />
          <div className="editor-frame">
            <ProseEditor
              ref={bodyRef}
              value={note.body}
              form={form}
              checked={note.checked}
              placeholder={meta.placeholder}
              onChange={(body) => update(note.id, { body })}
            />
          </div>
          {empty ? (
            <div className="mt-6">
              <p className="sheet-foot text-sm">Or open a page that already has a shape.</p>
              <div className="mt-2 flex flex-col">
                {samples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="tap min-h-11 rounded-lg text-left text-sm text-copper"
                    onClick={() => select(sample.id)}
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <p className="sheet-foot mt-8 flex items-center justify-between text-sm tabular-nums">
            <span>
              {words} {words === 1 ? "word" : "words"}
            </span>
            <span>{note.example ? "Sample" : meta.label}</span>
          </p>
        </div>
      </article>
    </div>
  );
}

function Reading() {
  const { note, form } = useScope();
  const toggleCheck = useNotes((state) => state.toggleCheck);
  const card = useMemo(
    () => extract(form, note.title, note.body, note.checked),
    [form, note.title, note.body, note.checked],
  );
  return <Found card={card} onToggle={(key) => toggleCheck(note.id, key)} />;
}

function MobileReading({ onOpen }: { onOpen: () => void }) {
  const { note, form } = useScope();
  const card = useMemo(
    () => extract(form, note.title, note.body, note.checked),
    [form, note.title, note.body, note.checked],
  );
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-full bg-paper px-4 text-left text-sm"
    >
      <span className="shrink-0">On the page</span>
      <span className="truncate text-muted">{foundSummary(card)}</span>
    </button>
  );
}

function IconButton({
  children,
  label,
  onClick,
  className,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`tap grid size-11 place-items-center rounded-full ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function TextButton({
  children,
  onClick,
  label,
  tone,
}: {
  children: ReactNode;
  onClick: () => void;
  label?: string;
  tone?: "copper";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        tone === "copper"
          ? "tap inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm text-copper"
          : "tap inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm text-ink-soft"
      }
    >
      {children}
    </button>
  );
}
