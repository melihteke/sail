import * as React from "react";
import { MapPin, Search } from "lucide-react";
import { searchPlaces, type Place, type PlaceSuggestion } from "@/lib/settings";

/** Search box with address autocomplete (Photon / OpenStreetMap). Calls onPick with the chosen place. */
export default function LocationSearch({ onPick, placeholder = "Search a place or address…", autoFocus }: { onPick: (place: Place) => void; placeholder?: string; autoFocus?: boolean }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<PlaceSuggestion[]>([]);
  const [active, setActive] = React.useState(0);
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle");
  const listId = React.useId();

  React.useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      setState("loading");
      try {
        setResults(await searchPlaces(query, ctrl.signal));
        setActive(0);
        setState("idle");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    }, 350);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const pick = (s: PlaceSuggestion) => {
    const label = s.city && s.city !== s.name ? `${s.name}, ${s.city}` : s.name;
    onPick({ name: label, lat: +s.lat.toFixed(5), lon: +s.lon.toFixed(5) });
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (!results.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a - 1 + results.length) % results.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(results[active]!);
          } else if (e.key === "Escape") setResults([]);
        }}
        placeholder={placeholder}
        aria-label="Search location"
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      </div>
      {(results.length > 0 || state !== "idle") && (
        <ul id={listId} role="listbox" className="absolute z-[600] mt-1 max-h-72 w-full overflow-auto rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg">
          {state === "loading" && results.length === 0 && <li className="px-3 py-2 text-muted-foreground">Searching…</li>}
          {state === "error" && <li className="px-3 py-2 text-destructive">Search is unavailable right now.</li>}
          {results.map((s, i) => (
            <li
              key={`${s.lat},${s.lon},${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-start gap-2 rounded-md px-3 py-2 ${i === active ? "bg-secondary" : ""}`}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{s.name}</span>
                {s.detail && <span className="block truncate text-xs text-muted-foreground">{s.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">Search © OpenStreetMap contributors (Photon)</p>
    </div>
  );
}
