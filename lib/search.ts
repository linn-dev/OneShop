export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchesProductSearch(
  item: { title: string; category: string; description?: string | null },
  query: string,
): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  const haystack = [item.title, item.category, item.description ?? ""]
    .join(" ")
    .toLowerCase();
  return q.split(" ").every((token) => haystack.includes(token));
}
