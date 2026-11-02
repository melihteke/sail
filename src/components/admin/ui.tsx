import * as React from "react";
import { marked } from "marked";
import { cn } from "@/lib/utils";

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
        variant === "primary" && "bg-primary text-primary-foreground shadow hover:opacity-90",
        variant === "secondary" && "border border-border bg-background hover:bg-secondary",
        variant === "ghost" && "text-muted-foreground hover:bg-secondary hover:text-foreground",
        variant === "danger" && "border border-destructive/40 text-destructive hover:bg-destructive/10",
        className,
      )}
    />
  );
}

export function Card({ title, actions, children, className }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold tracking-tight">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  const id = React.useId();
  const child = React.isValidElement<{ id?: string }>(children) ? React.cloneElement(children, { id: children.props.id ?? id }) : children;
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {child}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

export function Input(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Select(props: React.ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, "pr-8", props.className)} />;
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "min-h-24 font-mono text-[13px] leading-relaxed", props.className)} />;
}

/** Comma-separated text field bound to a string array. */
export function TagInput({ value, onChange, placeholder, id }: { value: string[]; onChange: (next: string[]) => void; placeholder?: string; id?: string }) {
  const [text, setText] = React.useState(value.join(", "));
  React.useEffect(() => setText(value.join(", ")), [value]);
  return (
    <Input
      id={id}
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.currentTarget.value)}
      onBlur={() =>
        onChange(
          text
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

export function MarkdownField({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (next: string) => void; placeholder?: string; hint?: string }) {
  const [preview, setPreview] = React.useState(false);
  const html = React.useMemo(() => (preview ? (marked.parse(value || "_Nothing yet._", { async: false }) as string) : ""), [preview, value]);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <div className="inline-flex rounded-lg bg-muted/70 p-0.5 text-[11px] font-medium" role="tablist" aria-label={`${label} editor mode`}>
          <button type="button" role="tab" aria-selected={!preview} onClick={() => setPreview(false)} className={cn("rounded-md px-2 py-1", !preview ? "bg-background shadow-sm" : "text-muted-foreground")}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={preview} onClick={() => setPreview(true)} className={cn("rounded-md px-2 py-1", preview ? "bg-background shadow-sm" : "text-muted-foreground")}>
            Preview
          </button>
        </div>
      </div>
      {preview ? (
        <div className="prose prose-sm prose-slate min-h-28 max-w-none rounded-lg border border-border bg-background px-3 py-2 dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <TextArea value={value} placeholder={placeholder} onChange={(e) => onChange(e.currentTarget.value)} rows={Math.min(16, Math.max(5, value.split("\n").length + 1))} aria-label={label} />
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">{hint ?? "Markdown: **bold**, _italic_, - lists, [links](https://…)."}</p>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "ok"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "info" && "border-border bg-secondary",
        tone === "ok" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
        tone === "warn" && "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
        tone === "error" && "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} />;
}

/** Click-or-drop file picker. */
export function DropZone({
  accept,
  multiple,
  disabled,
  onFiles,
  children,
}: {
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
}) {
  const input = React.useRef<HTMLInputElement | null>(null);
  const [over, setOver] = React.useState(false);
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          input.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onFiles([...e.dataTransfer.files]);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        over ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {children}
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = [...(e.currentTarget.files ?? [])];
          e.currentTarget.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

/** Debounced autosave: calls `save` with merged pending changes after `delay` ms of quiet. */
export function useAutosave<T extends object>(save: (patch: Partial<T>) => Promise<void>, delay = 1200) {
  const pending = React.useRef<Partial<T>>({});
  const timer = React.useRef<number | null>(null);
  const [state, setState] = React.useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const saveRef = React.useRef(save);
  saveRef.current = save;

  const flush = React.useCallback(async () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    const patch = pending.current;
    if (!Object.keys(patch).length) return;
    pending.current = {};
    setState("saving");
    try {
      await saveRef.current(patch);
      setError(null);
      setState(Object.keys(pending.current).length ? "pending" : "saved");
    } catch (e) {
      pending.current = { ...patch, ...pending.current };
      setError((e as Error).message);
      setState("error");
    }
  }, []);

  const queue = React.useCallback(
    (patch: Partial<T>) => {
      pending.current = { ...pending.current, ...patch };
      setState("pending");
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), delay);
    },
    [delay, flush],
  );

  React.useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pending.current).length) e.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      void flush();
    };
  }, [flush]);

  return { queue, flush, state, error };
}

export function SaveState({ state, error }: { state: string; error: string | null }) {
  const label = { idle: "", pending: "Unsaved changes…", saving: "Saving…", saved: "All changes saved", error: `Save failed: ${error}` }[state] ?? "";
  return (
    <span className={cn("text-xs", state === "error" ? "text-destructive" : "text-muted-foreground")} aria-live="polite">
      {label}
    </span>
  );
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function navigate(hash: string) {
  window.location.hash = hash;
}
