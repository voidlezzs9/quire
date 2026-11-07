import { saveExport, type ExportFile } from "./export.ts";

const DB_NAME = "quire.files";
const STORE = "handles";
const MAX_BYTES = 1_500_000;

const memory = new Map<string, FileSystemFileHandle>();

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    startIn?: "documents";
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: { description?: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options?: {
    startIn?: "documents";
    suggestedName?: string;
    types?: { description?: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle>;
};

function pickers(): PickerWindow {
  return window;
}

const TEXT_EXT = [".txt", ".md", ".csv", ".py", ".sql", ".ts", ".tsx", ".js", ".jsx", ".ipynb"];

export function titleFromFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? name;
  if (/\.(py|ipynb|sql|ts|tsx|js|jsx|mjs)$/i.test(base)) return base;
  return base.replace(/\.(txt|md|csv)$/i, "");
}

/** Turn a Jupyter notebook into the `# %%` text Quire already saves. */
export function notebookToText(raw: string): string {
  const data = JSON.parse(raw) as { cells?: unknown };
  if (!data || !Array.isArray(data.cells)) return raw;
  return data.cells
    .map((cell) => {
      if (!cell || typeof cell !== "object") return "";
      const record = cell as { cell_type?: string; source?: string | string[] };
      const source = Array.isArray(record.source) ? record.source.join("") : (record.source ?? "");
      const marker = record.cell_type === "markdown" ? "# %% [markdown]" : "# %%";
      return `${marker}\n${source.replace(/\n+$/, "")}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function textFromFile(name: string, raw: string): string {
  if (name.toLowerCase().endsWith(".ipynb")) {
    try {
      return notebookToText(raw);
    } catch {
      return raw;
    }
  }
  return raw.replace(/^\uFEFF/, "");
}

export function linkedFile(noteId: string): FileSystemFileHandle | null {
  return memory.get(noteId) ?? null;
}

export async function loadLinkedFiles(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const database = await openDb();
  const pairs = await new Promise<[string, FileSystemFileHandle][]>((resolve, reject) => {
    const tx = database.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    const keys = tx.objectStore(STORE).getAllKeys();
    tx.oncomplete = () => {
      const names = (keys.result ?? []).map((key) => String(key));
      const handles = (request.result ?? []) as FileSystemFileHandle[];
      resolve(names.map((name, index) => [name, handles[index]] as [string, FileSystemFileHandle]));
    };
    tx.onerror = () => reject(tx.error);
  });
  for (const [id, handle] of pairs) {
    if (handle) memory.set(id, handle);
  }
}

export type OpenedDocument = {
  title: string;
  body: string;
  handle: FileSystemFileHandle | null;
};

export async function openDocument(): Promise<OpenedDocument | null> {
  const picker = pickers().showOpenFilePicker;
  if (!picker) return openWithInput();
  const [handle] = await picker({
    startIn: "documents",
    multiple: false,
    excludeAcceptAllOption: false,
    types: [
      {
        description: "Notes and source",
        accept: {
          "text/plain": TEXT_EXT.filter((ext) => ext !== ".ipynb"),
          "application/json": [".ipynb"],
        },
      },
    ],
  });
  const file = await handle.getFile();
  if (file.size > MAX_BYTES) throw new Error("That file is larger than Quire can open.");
  const body = textFromFile(file.name, await file.text());
  return { title: titleFromFilename(file.name), body, handle };
}

export async function saveToDocuments(
  file: ExportFile,
  existing: FileSystemFileHandle | null,
): Promise<FileSystemFileHandle | "download"> {
  const picker = pickers().showSaveFilePicker;
  if (!picker && !existing) {
    saveExport(file);
    return "download";
  }
  const handle =
    existing ??
    (await picker!({
      startIn: "documents",
      suggestedName: file.name,
      types: [
        {
          description: file.name,
          accept: { [file.mime.split(";")[0] || "application/octet-stream"]: [extensionOf(file.name)] },
        },
      ],
    }));
  const granted = await askToWrite(handle);
  if (!granted) throw new Error("The folder permission was not granted.");
  const writable = await handle.createWritable();
  await writable.write(new Blob([file.body], { type: file.mime }));
  await writable.close();
  return handle;
}

export function rememberFile(noteId: string, handle: FileSystemFileHandle): void {
  memory.set(noteId, handle);
  void persist(noteId, handle);
}

export function cancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function askToWrite(handle: FileSystemFileHandle): Promise<boolean> {
  const file = handle as FileSystemFileHandle & {
    requestPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  };
  if (!file.requestPermission) return Promise.resolve(true);
  return file.requestPermission({ mode: "readwrite" }).then((state) => state === "granted");
}

function extensionOf(name: string): string {
  const match = name.match(/\.[a-z0-9]+$/i);
  return match?.[0] ?? ".txt";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function persist(noteId: string, handle: FileSystemFileHandle): Promise<void> {
  return openDb().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(handle, noteId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

function openWithInput(): Promise<OpenedDocument | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = TEXT_EXT.join(",");
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      if (file.size > MAX_BYTES) {
        resolve(Promise.reject(new Error("That file is larger than Quire can open.")));
        return;
      }
      void file.text().then((raw) => {
        resolve({ title: titleFromFilename(file.name), body: textFromFile(file.name, raw), handle: null });
      });
    };
    input.click();
  });
}
