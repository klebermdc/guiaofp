import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  debounceMs?: number;
  /** Called after debounce OR on blur (flush). */
  onCommit: (value: string) => void | Promise<void>;
};

/**
 * Textarea com estado local para evitar re-render do pai a cada tecla.
 * Faz commit debounced e também no blur (flush) para não perder alterações.
 */
export function AttractionNoteField({
  value,
  placeholder,
  rows = 2,
  className,
  disabled,
  debounceMs = 800,
  onCommit,
}: Props) {
  const [draft, setDraft] = useState(value ?? "");
  const dirtyRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const lastCommittedRef = useRef(value ?? "");

  // Keep draft in sync when value changes from outside (e.g., reload), but
  // do not clobber the user's current typing.
  useEffect(() => {
    if (dirtyRef.current) return;
    const next = value ?? "";
    setDraft(next);
    lastCommittedRef.current = next;
  }, [value]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(async () => {
    clearTimer();

    const current = draft;
    if (current === lastCommittedRef.current) {
      dirtyRef.current = false;
      return;
    }

    lastCommittedRef.current = current;
    dirtyRef.current = false;
    await onCommit(current);
  }, [clearTimer, draft, onCommit]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleChange = useCallback(
    (next: string) => {
      dirtyRef.current = true;
      setDraft(next);
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        // fire-and-forget; errors are handled by caller
        void flush();
      }, debounceMs);
    },
    [clearTimer, debounceMs, flush]
  );

  const textareaClass = useMemo(() => {
    const base = "text-sm resize-none";
    return className ? `${base} ${className}` : base;
  }, [className]);

  return (
    <Textarea
      placeholder={placeholder}
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => void flush()}
      className={textareaClass}
      rows={rows}
      disabled={disabled}
    />
  );
}
