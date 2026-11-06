import * as React from "react";
import { Flag, Plus, Star, Trash2 } from "lucide-react";
import { db } from "@/lib/supabase";
import { url } from "@/lib/url";
import { Button, Card, Field, Input, Notice, Select, Spinner } from "./ui";

interface CourseRow {
  id: string;
  name: string;
  area: string;
  active: boolean;
  is_current: boolean;
  sort: number;
}

interface ResultRow {
  id: string;
  name: string;
  time_s: number;
  tacks: number;
  gybes: number;
  distance_m: number;
  source: "race" | "admin";
  created_at: string;
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
};

/** "17:23.4", "17:23" or "1043.4" → seconds. */
export function parseRaceTime(text: string): number | null {
  const t = text.trim().replace(",", ".");
  const m = /^(\d{1,3}):([0-5]?\d(?:\.\d)?)$/.exec(t);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return /^\d{1,5}(\.\d)?$/.test(t) ? Number(t) : null;
}

export default function RacePage() {
  const [courses, setCourses] = React.useState<CourseRow[] | null>(null);
  const [selected, setSelected] = React.useState<string>("");
  const [results, setResults] = React.useState<ResultRow[] | null>(null);
  const [notice, setNotice] = React.useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [form, setForm] = React.useState({ name: "", time: "", tacks: "8", gybes: "4" });

  const loadCourses = React.useCallback(async () => {
    const { data, error } = await db().from("race_courses").select("id,name,area,active,is_current,sort").order("sort");
    if (error) throw error;
    setCourses(data as CourseRow[]);
    setSelected((s) => s || (data as CourseRow[]).find((c) => c.is_current)?.id || (data as CourseRow[])[0]?.id || "");
  }, []);

  const loadResults = React.useCallback(async (course: string) => {
    if (!course) return;
    setResults(null);
    const { data, error } = await db()
      .from("race_results")
      .select("id,name,time_s,tacks,gybes,distance_m,source,created_at")
      .eq("course_id", course)
      .order("time_s")
      .order("created_at");
    if (error) throw error;
    setResults((data as ResultRow[]).map((r) => ({ ...r, time_s: Number(r.time_s) })));
  }, []);

  React.useEffect(() => {
    loadCourses().catch((e: Error) =>
      setNotice({ tone: "error", text: e.message.includes("race_courses") ? "Race tables not found: run supabase/migrations/0003_race.sql and 0004_race_courses.sql in the Supabase SQL editor." : e.message }),
    );
  }, [loadCourses]);

  React.useEffect(() => {
    loadResults(selected).catch((e: Error) => setNotice({ tone: "error", text: e.message }));
  }, [selected, loadResults]);

  const run = async (fn: () => Promise<void>, ok: string) => {
    setNotice(null);
    try {
      await fn();
      setNotice({ tone: "ok", text: ok });
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    }
  };

  const setActive = (c: CourseRow, active: boolean) =>
    run(async () => {
      if (c.is_current && !active) throw new Error("Make another course current before closing this one.");
      setCourses((list) => list?.map((x) => (x.id === c.id ? { ...x, active } : x)) ?? list);
      const { error } = await db().from("race_courses").update({ active }).eq("id", c.id);
      if (error) {
        await loadCourses();
        throw error;
      }
      await loadCourses();
    }, `${c.name} is ${active ? "open" : "closed"} for racing.`);

  const makeCurrent = (c: CourseRow) =>
    run(async () => {
      const { error } = await db().rpc("race_set_current", { p_course: c.id });
      if (error) throw error;
      await loadCourses();
    }, `${c.name} is now the current course.`);

  const remove = (r: ResultRow) => {
    if (!window.confirm(`Delete ${r.name} (${fmt(r.time_s)}) from the scoreboard?`)) return;
    void run(async () => {
      const { error } = await db().from("race_results").delete().eq("id", r.id);
      if (error) throw error;
      await loadResults(selected);
    }, `Deleted ${r.name}.`);
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const time = parseRaceTime(form.time);
    const name = form.name.trim();
    if (!name || name.length < 2 || name.length > 24 || time === null || time <= 0) {
      setNotice({ tone: "error", text: "Enter a name (2–24 characters) and a time like 17:23.4." });
      return;
    }
    void run(async () => {
      const { error } = await db()
        .from("race_results")
        .insert({ course_id: selected, name, time_s: time, tacks: Number(form.tacks) || 0, gybes: Number(form.gybes) || 0, source: "admin" });
      if (error) throw error;
      setForm((f) => ({ ...f, name: "", time: "" }));
      await loadResults(selected);
    }, `Added ${name} (${fmt(time)}). Only the best 30 per course are kept.`);
  };

  if (!courses) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Races</h1>
        {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : <Spinner />}
      </div>
    );
  }

  const course = courses.find((c) => c.id === selected);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Races</h1>
        <a className="text-sm text-primary hover:underline" href={url("/academy/#/race")} target="_blank" rel="noopener">
          Open the race page ↗
        </a>
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <Card title="Courses">
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          Open courses can be raced; the current one is shown first on the race page and scoreboard. Each course has its own scoreboard.
        </p>
        <ul className="divide-y divide-border">
          {courses.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <label className="flex min-w-0 flex-1 items-center gap-3">
                <input type="checkbox" checked={c.active} onChange={(e) => void setActive(c, e.target.checked)} />
                <span className="min-w-0">
                  <span className="block font-medium">
                    {c.name}
                    {c.is_current && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                        <Star className="h-3 w-3" /> Current
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-muted-foreground">{c.area}</span>
                </span>
              </label>
              {!c.is_current && (
                <Button size="sm" variant="secondary" onClick={() => void makeCurrent(c)}>
                  <Flag className="h-3.5 w-3.5" /> Make current
                </Button>
              )}
              <Button size="sm" variant={selected === c.id ? "primary" : "ghost"} onClick={() => setSelected(c.id)}>
                Scoreboard
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card
        title={`Scoreboard · ${course?.name ?? ""}`}
        actions={
          <Select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Course">
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        }
      >
        {!results ? (
          <Spinner />
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No times on this course yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-2">#</th>
                  <th className="py-1.5 pr-2">Name</th>
                  <th className="py-1.5 pr-2 text-right">Time</th>
                  <th className="py-1.5 pr-2 text-right">Tacks</th>
                  <th className="py-1.5 pr-2 text-right">Gybes</th>
                  <th className="py-1.5 pr-2">Added</th>
                  <th className="py-1.5" />
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-1.5 pr-2">{i + 1}</td>
                    <td className="py-1.5 pr-2">
                      {r.name}
                      {r.source === "admin" && <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">added</span>}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">{fmt(r.time_s)}</td>
                    <td className="py-1.5 pr-2 text-right">{r.tacks}</td>
                    <td className="py-1.5 pr-2 text-right">{r.gybes}</td>
                    <td className="py-1.5 pr-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="py-1.5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => remove(r)} aria-label={`Delete ${r.name}`}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Add a score">
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-[1fr_8rem_5rem_5rem_auto] sm:items-end">
          <Field label="Name">
            <Input value={form.name} maxLength={24} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ellen" />
          </Field>
          <Field label="Time">
            <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="17:23.4" />
          </Field>
          <Field label="Tacks">
            <Input type="number" min={0} value={form.tacks} onChange={(e) => setForm({ ...form, tacks: e.target.value })} />
          </Field>
          <Field label="Gybes">
            <Input type="number" min={0} value={form.gybes} onChange={(e) => setForm({ ...form, gybes: e.target.value })} />
          </Field>
          <Button type="submit" variant="primary" disabled={!selected}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">Added scores appear like any other entry for visitors. Only the best 30 per course are kept.</p>
      </Card>
    </div>
  );
}
