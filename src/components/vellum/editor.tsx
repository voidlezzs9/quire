import { forwardRef, useLayoutEffect, useRef } from "react";
import type { FormId } from "@/lib/vellum/forms";
import { settleBody } from "@/lib/vellum/live";
import { escapeText, renderMarks } from "@/lib/vellum/marks";
import { tidyProse } from "@/lib/vellum/prose";

type ProseEditorProps = {
  value: string;
  placeholder: string;
  form: FormId;
  checked: readonly string[];
  onChange: (value: string) => void;
};

export const ProseEditor = forwardRef<HTMLTextAreaElement, ProseEditorProps>(function ProseEditor(
  { value, placeholder, form, checked, onChange },
  ref,
) {
  const shown = value ? renderMarks(value, form, checked) : escapeText(placeholder);
  const node = useRef<HTMLTextAreaElement | null>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (caret.current == null || !node.current) return;
    const pos = caret.current;
    caret.current = null;
    node.current.setSelectionRange(pos, pos);
  }, [value]);

  return (
    <div className="editor">
      <pre
        aria-hidden="true"
        className={value ? undefined : "is-placeholder"}
        dangerouslySetInnerHTML={{ __html: shown }}
      />
      <textarea
        ref={(element) => {
          node.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        value={value}
        placeholder={placeholder}
        aria-label="Note"
        spellCheck={form !== "code"}
        autoCapitalize={form === "code" ? "off" : "sentences"}
        autoCorrect={form === "code" ? "off" : "on"}
        onPaste={(event) => {
          if (form === "code") return;
          const pasted = event.clipboardData.getData("text/plain");
          if (!pasted) return;
          const tidy = tidyProse(pasted);
          if (tidy === pasted) return;
          event.preventDefault();
          const start = event.currentTarget.selectionStart ?? 0;
          const end = event.currentTarget.selectionEnd ?? start;
          const next = event.currentTarget.value.slice(0, start) + tidy + event.currentTarget.value.slice(end);
          const settled = settleBody(next, start + tidy.length);
          caret.current = settled.caret;
          onChange(settled.text);
        }}
        onChange={(event) => {
          const here = event.target.selectionStart ?? event.target.value.length;
          const settled = settleBody(event.target.value, here);
          if (settled.text !== event.target.value) caret.current = settled.caret;
          onChange(settled.text);
        }}
      />
    </div>
  );
});
