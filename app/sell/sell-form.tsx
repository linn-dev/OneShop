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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(file: File) {
    setError(null);
    setProvider(null);
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

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
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
          disabled={analyzing}
          className={cn(
            "flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 text-sm transition hover:bg-muted/70",
            preview ? "p-0" : "min-h-48 px-4 py-10",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Item preview" className="max-h-72 w-full object-cover" />
          ) : (
            <>
              <span className="font-medium">Upload a photo</span>
              <span className="mt-1 text-muted-foreground">
                JPEG, PNG, WebP, or GIF · stored in /public/uploads
              </span>
            </>
          )}
        </button>
        {analyzing && (
          <p className="mt-2 text-sm text-muted-foreground">Analyzing photo and drafting the listing…</p>
        )}
        {provider === "fallback" && (
          <p className="mt-2 text-sm text-muted-foreground">
            No OpenAI/Claude key found — fill in the details yourself, or add OPENAI_API_KEY /
            ANTHROPIC_API_KEY.
          </p>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Title</span>
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

      <div className="grid grid-cols-2 gap-4">
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
