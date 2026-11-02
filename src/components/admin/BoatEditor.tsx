import * as React from "react";
import { ArrowLeft, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { deleteBoat, listBoats, publicUrl, saveBoat, uploadBoatPhoto, MEDIA_BUCKET, type BoatPatch } from "@/lib/admin-api";
import { slugify } from "@/lib/sections";
import type { BoatRow, BoatSpec, PhotoCredit } from "@/lib/types";
import { url } from "@/lib/url";
import { Button, Card, DropZone, Field, Input, MarkdownField, Notice, SaveState, Spinner, navigate, useAutosave } from "./ui";

const EMPTY: BoatPatch = { name: "", slug: "", model: "", description: "", specs: [], is_default: false };

export default function BoatEditor({ id }: { id: string | null }) {
  const [boat, setBoat] = React.useState<BoatRow | null>(null);
  const [draft, setDraft] = React.useState<BoatPatch>(EMPTY);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<null | "create" | "photo" | "delete">(null);
  const [notice, setNotice] = React.useState<{ tone: "ok" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (!id) return;
    listBoats()
      .then((boats) => {
        const found = boats.find((b) => b.id === id);
        if (!found) throw new Error("Boat not found");
        setBoat(found);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const save = useAutosave<BoatRow>(async (patch) => {
    if (!boat) return;
    const updated = await saveBoat(boat.id, patch as BoatPatch);
    setBoat((b) => (b ? { ...b, slug: updated.slug, updated_at: updated.updated_at } : updated));
  });

  // New boat: collect fields locally until "Create boat"; existing boat: autosave each change.
  const value = (boat ?? draft) as BoatRow;
  const set = <K extends keyof BoatRow>(key: K, v: BoatRow[K]) => {
    if (boat) {
      setBoat({ ...boat, [key]: v });
      save.queue({ [key]: v } as Partial<BoatRow>);
    } else {
      setDraft((d) => ({ ...d, [key]: v, ...(key === "name" ? { slug: slugify(String(v)) } : {}) }));
    }
  };

  if (error) return <Notice tone="error">{error}</Notice>;
  if (id && !boat) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  const create = async () => {
    if (!draft.name?.trim()) return setNotice({ tone: "error", text: "Give the boat a name." });
    setBusy("create");
    try {
      const created = await saveBoat(null, { ...draft, name: draft.name.trim(), slug: draft.slug || slugify(draft.name) });
      navigate(`#/boats/${created.id}`);
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
      setBusy(null);
    }
  };

  const onPhoto = async (files: File[]) => {
    const file = files[0];
    if (!file || !boat) return;
    setBusy("photo");
    setNotice(null);
    try {
      await save.flush();
      const updated = await uploadBoatPhoto(boat.id, file, boat.photo_path);
      setBoat((b) => (b ? { ...b, photo_path: updated.photo_path } : updated));
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async () => {
    if (!boat || !confirm(`Delete ${boat.name}? Sails on this boat keep their data but lose the boat link.`)) return;
    setBusy("delete");
    try {
      await deleteBoat(boat);
      navigate("#/boats");
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
      setBusy(null);
    }
  };

  const specs: BoatSpec[] = value.specs ?? [];
  const setSpec = (i: number, patch: Partial<BoatSpec>) => set("specs", specs.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const credit: PhotoCredit | null = value.photo_credit ?? null;
  const setCredit = (patch: Partial<PhotoCredit>) => {
    const next = { text: "", ...credit, ...patch };
    set("photo_credit", next.text || next.url || next.license ? next : null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("#/boats")} aria-label="Back to boats">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">{boat ? boat.name || "Boat" : "New boat"}</h1>
        {boat && <SaveState state={save.state} error={save.error} />}
        {boat && (
          <a href={url(`/boats/${boat.slug}`)} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
            View live
          </a>
        )}
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <Card title="Boat">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name">
            <Input value={value.name ?? ""} onChange={(e) => set("name", e.currentTarget.value)} placeholder="Polyvalk" />
          </Field>
          <Field label="Model">
            <Input value={value.model ?? ""} onChange={(e) => set("model", e.currentTarget.value || null)} placeholder="Polyvalk Classic" />
          </Field>
          <Field label="URL slug" hint="/boats/<slug>">
            <Input value={value.slug ?? ""} onChange={(e) => set("slug", e.currentTarget.value)} />
          </Field>
          <Field label="Builder">
            <Input value={value.builder ?? ""} onChange={(e) => set("builder", e.currentTarget.value || null)} />
          </Field>
          <Field label="Builder website">
            <Input type="url" value={value.builder_url ?? ""} onChange={(e) => set("builder_url", e.currentTarget.value || null)} />
          </Field>
          <Field label="Designer">
            <Input value={value.designer ?? ""} onChange={(e) => set("designer", e.currentTarget.value || null)} />
          </Field>
          <Field label="Design year">
            <Input type="number" value={value.design_year ?? ""} onChange={(e) => set("design_year", e.currentTarget.value ? Number(e.currentTarget.value) : null)} />
          </Field>
          <Field label="Sail number">
            <Input value={value.sail_number ?? ""} onChange={(e) => set("sail_number", e.currentTarget.value || null)} />
          </Field>
          <Field label="Home water">
            <Input value={value.home_water ?? ""} onChange={(e) => set("home_water", e.currentTarget.value || null)} placeholder="De Poel, Amstelveen" />
          </Field>
          <Field label="Main boat">
            <label className="flex h-[38px] items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(value.is_default)} onChange={(e) => set("is_default", e.currentTarget.checked)} className="h-4 w-4 accent-[var(--primary)]" />
              Pre-selected for new sails
            </label>
          </Field>
        </div>
        <div className="mt-5">
          <MarkdownField label="Description" value={value.description ?? ""} onChange={(v) => set("description", v)} placeholder="History, character, what she's like to sail…" />
        </div>
        {!boat && (
          <div className="mt-5">
            <Button variant="primary" onClick={() => void create()} disabled={busy !== null}>
              {busy === "create" && <Spinner className="h-3.5 w-3.5" />} Create boat
            </Button>
          </div>
        )}
      </Card>

      {boat && (
        <>
          <Card title="Photo">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-xl border border-border bg-sky-100 dark:bg-sky-950">
                {boat.photo_path ? (
                  <img src={publicUrl(MEDIA_BUCKET, boat.photo_path)} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">No photo yet</div>
                )}
              </div>
              <div className="space-y-3">
                <DropZone accept="image/*,.heic,.heif" onFiles={(f) => void onPhoto(f)} disabled={busy !== null}>
                  {busy === "photo" ? <Spinner className="text-primary" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
                  <span className="text-xs">{boat.photo_path ? "Replace photo" : "Upload photo"}</span>
                </DropZone>
                <Field label="Photo credit" hint="Needed when the photo isn't yours (e.g. Wikimedia Commons).">
                  <Input value={credit?.text ?? ""} onChange={(e) => setCredit({ text: e.currentTarget.value })} placeholder="Photo: Jane Doe" />
                </Field>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Credit link">
                    <Input type="url" value={credit?.url ?? ""} onChange={(e) => setCredit({ url: e.currentTarget.value || undefined })} />
                  </Field>
                  <Field label="License">
                    <Input value={credit?.license ?? ""} onChange={(e) => setCredit({ license: e.currentTarget.value || undefined })} placeholder="CC BY-SA 4.0" />
                  </Field>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Specifications"
            actions={
              <Button size="sm" onClick={() => set("specs", [...specs, { label: "", value: "" }])}>
                <Plus className="h-3.5 w-3.5" /> Add row
              </Button>
            }
          >
            {specs.length === 0 && <p className="text-sm text-muted-foreground">No specifications yet. Add rows like “Length overall · 6.50 m”.</p>}
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                  <Input value={s.label} onChange={(e) => setSpec(i, { label: e.currentTarget.value })} placeholder="Label" aria-label="Label" />
                  <Input value={s.value} onChange={(e) => setSpec(i, { value: e.currentTarget.value })} placeholder="Value" aria-label="Value" />
                  <Input value={s.hint ?? ""} onChange={(e) => setSpec(i, { hint: e.currentTarget.value || undefined })} placeholder="Note (optional)" aria-label="Note" />
                  <Button size="sm" variant="ghost" aria-label="Remove row" onClick={() => set("specs", specs.filter((_, k) => k !== i))}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Button variant="danger" onClick={() => void onDelete()} disabled={busy !== null}>
              {busy === "delete" ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-4 w-4" />} Delete boat
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
