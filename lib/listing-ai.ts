import { readFile } from "fs/promises";
import { ITEM_CATEGORIES, normalizeCategory } from "@/lib/categories";
import { resolvePublicUpload } from "@/lib/uploads";

export type ListingDraft = {
  title: string;
  description: string;
  category: string;
  suggestedPrice: number;
};

const PROMPT = `You are helping a seller on OneShopMM, a local second-hand marketplace.
Look at the item photo and return JSON only (no markdown) with:
- title: short marketplace listing title
- description: 2-4 sentences, honest condition notes if visible
- category: exactly one of ${ITEM_CATEGORIES.join(", ")}
- suggestedPrice: a number (local second-hand price, no currency symbol)

Be conservative on price. If the item is unclear, still make a best-effort listing.`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fence ? fence[1] : trimmed).trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("Model did not return valid JSON.");
  }
}

function toDraft(parsed: unknown): ListingDraft {
  const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const priceRaw = obj.suggestedPrice ?? obj.price;
  const price = typeof priceRaw === "number" ? priceRaw : Number.parseFloat(String(priceRaw ?? ""));
  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  const description = typeof obj.description === "string" ? obj.description.trim() : "";

  return {
    title: title || "Second-hand item",
    description: description || "Gently used. Add extra details before publishing.",
    category: normalizeCategory(obj.category),
    suggestedPrice: Number.isFinite(price) && price > 0 ? Math.round(price * 100) / 100 : 20,
  };
}

function mimeFromPath(filePath: string) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

async function loadImage(imageUrl: string) {
  const filePath = resolvePublicUpload(imageUrl);
  if (!filePath) {
    throw new Error("Invalid image path.");
  }
  const buffer = await readFile(filePath);
  return { buffer, mimeType: mimeFromPath(filePath), base64: buffer.toString("base64") };
}

async function fromChatCompletions(opts: {
  url: string;
  apiKey: string;
  model: string;
  label: string;
  imageUrl: string;
  jsonObject?: boolean;
  extraHeaders?: Record<string, string>;
}): Promise<ListingDraft> {
  const { base64, mimeType } = await loadImage(opts.imageUrl);
  const res = await fetch(opts.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
      ...opts.extraHeaders,
    },
    body: JSON.stringify({
      model: opts.model,
      ...(opts.jsonObject ? { response_format: { type: "json_object" } } : {}),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${opts.label} error: ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${opts.label} returned an empty listing.`);
  return toDraft(extractJson(content));
}

async function fromOpenRouter(imageUrl: string): Promise<ListingDraft> {
  return fromChatCompletions({
    url: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    // Free vision-capable router; override with e.g. google/gemma-4-31b-it:free
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    label: "OpenRouter",
    imageUrl,
    extraHeaders: {
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "OneShopMM",
    },
  });
}

async function fromOpenAI(imageUrl: string): Promise<ListingDraft> {
  return fromChatCompletions({
    url: "https://api.openai.com/v1/chat/completions",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    label: "OpenAI",
    imageUrl,
    jsonObject: true,
  });
}

async function fromClaude(imageUrl: string): Promise<ListingDraft> {
  const { base64, mimeType } = await loadImage(imageUrl);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: base64 },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude error: ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Claude returned an empty listing.");
  return toDraft(extractJson(text));
}

function fallbackDraft(): ListingDraft {
  return {
    title: "Second-hand item",
    description:
      "Photo uploaded. Add a title, condition notes, and a fair price before you publish.",
    category: "Other",
    suggestedPrice: 20,
  };
}

export async function generateListingFromImage(imageUrl: string): Promise<{
  listing: ListingDraft;
  provider: "openrouter" | "openai" | "claude" | "fallback";
}> {
  if (process.env.OPENROUTER_API_KEY) {
    return { listing: await fromOpenRouter(imageUrl), provider: "openrouter" };
  }
  if (process.env.OPENAI_API_KEY) {
    return { listing: await fromOpenAI(imageUrl), provider: "openai" };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { listing: await fromClaude(imageUrl), provider: "claude" };
  }
  return { listing: fallbackDraft(), provider: "fallback" };
}
