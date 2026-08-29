"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ITEM_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

type FormState = {
  title: string;
  description: string;
  category: string;
  suggestedPrice: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "Other",
  suggestedPrice: "",
};

export function SellForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiDrafted, setAiDrafted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(file: File) {
    setError(null);
    setProvider(null);
    setAiDrafted(false);
    setAnalyzing(true);
    setForm(emptyForm);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const uploadBody = new FormData();
      uploadBody.append("image", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadBody });
      const uploadJson = (await uploadRes.json()) as { imageUrl?: string; error?: string };
      if (!uploadRes.ok || !uploadJson.imageUrl) {
        throw new Error(uploadJson.error || "Upload failed.");
      }
      setImageUrl(uploadJson.imageUrl);

      const listRes = await fetch("/api/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadJson.imageUrl }),
      });
      const listJson = (await listRes.json()) as {
        title?: string;
        description?: string;
        category?: string;
        suggestedPrice?: number;
        provider?: string;
        error?: string;
      };
      if (!listRes.ok) {
        throw new Error(listJson.error || "Could not generate listing.");
      }

      setForm({
        title: listJson.title ?? "",
        description: listJson.description ?? "",
        category: listJson.category ?? "Other",
        suggestedPrice:
          listJson.suggestedPrice != null ? String(listJson.suggestedPrice) : "",
      });
      setAiDrafted(true);
      setProvider(listJson.provider ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      setError("Upload a photo first.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      if (navigator.geolocation) {
        const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            () => resolve(null),
            { enableHighAccuracy: false, timeout: 4000 },
          );
        });
        if (coords) {
          lat = coords.latitude;
          lng = coords.longitude;
        }
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          price: Number.parseFloat(form.suggestedPrice),
          imageUrl,
          lat,
          lng,
        }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        throw new Error(json.error || "Could not save listing.");
      }
      router.push(`/item/${json.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save listing.");
    } finally {
      setSaving(false);
    }
  }

  const step = saving ? 3 : analyzing ? 2 : imageUrl && form.title ? 3 : preview ? 2 : 1;

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" aria-label="Listing steps">
        <Step n={1} label="Photo" current={step} />
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Step n={2} label="AI draft" current={step} />
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Step n={3} label="Publish" current={step} />
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
          disabled={analyzing}
          className={cn(
            "flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 text-sm transition hover:bg-emerald-50/70 disabled:opacity-80",
            preview ? "p-0" : "min-h-64 px-6 py-16 sm:min-h-72",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Item preview" className="max-h-80 w-full object-cover" />
          ) : (
            <>
              <span className="text-base font-semibold text-emerald-900">Drop a photo or click to upload</span>
              <span className="mt-2 text-muted-foreground">
                JPEG, PNG, WebP, or GIF · stored in /public/uploads
              </span>
            </>
          )}
        </button>
        {analyzing && (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-card p-4">
            <p className="text-sm font-medium text-foreground">AI is drafting your listing…</p>
            <div className="mt-3 space-y-2" aria-hidden>
              <ShimmerBar className="h-3 w-full" />
              <ShimmerBar className="h-3 w-5/6" />
              <ShimmerBar className="h-3 w-2/3" />
            </div>
          </div>
        )}
        {provider === "fallback" && (
          <p className="mt-2 text-sm text-muted-foreground">
            No OpenAI/Claude key found — fill in the details yourself, or add OPENAI_API_KEY /
            ANTHROPIC_API_KEY.
          </p>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Title</span>
          {aiDrafted && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
              AI draft ✓
            </span>
          )}
        </span>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Description</span>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Category</span>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Price</span>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.suggestedPrice}
            onChange={(e) => update("suggestedPrice", e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={analyzing || saving || !imageUrl}>
        {saving ? "Publishing…" : "Publish listing"}
      </Button>
    </form>
  );
}

function Step({ n, label, current }: { n: number; label: string; current: number }) {
  const active = current === n;
  const done = current > n;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-medium",
        active && "text-primary",
        done && "text-emerald-700",
        !active && !done && "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs",
          active && "bg-primary text-primary-foreground",
          done && "bg-emerald-100 text-emerald-800",
          !active && !done && "bg-muted text-muted-foreground",
        )}
      >
        {n}
      </span>
      {label}
    </div>
  );
}

function ShimmerBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-full bg-[length:200%_100%] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200",
        className,
      )}
    />
  );
}

