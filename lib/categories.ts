export const ITEM_CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Home",
  "Sports",
  "Books",
  "Toys",
  "Other",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export function normalizeCategory(value: unknown): ItemCategory {
  if (typeof value === "string") {
    const match = ITEM_CATEGORIES.find(
      (c) => c.toLowerCase() === value.trim().toLowerCase(),
    );
    if (match) return match;
  }
  return "Other";
}
