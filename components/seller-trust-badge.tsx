import { BadgeCheck } from "lucide-react";
import { trustLabel, trustLevel, type SellerTrust } from "@/lib/trust";
import { cn } from "@/lib/utils";

function sellerInitials(seller: Pick<SellerTrust, "name" | "email">): string {
  const source = (seller.name || seller.email).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  const local = source.includes("@") ? source.slice(0, source.indexOf("@")) : source;
  return local.slice(0, 2).toUpperCase();
}

export function SellerTrustBadge({
  seller,
  compact = false,
}: {
  seller: SellerTrust;
  compact?: boolean;
}) {
  const level = trustLevel(seller);
  const label = trustLabel(level);
  const displayName = seller.name || seller.email;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm",
        level === "trusted" && "border-emerald-200 bg-emerald-50",
        level === "good" && "border-sky-200 bg-sky-50",
        level === "new" && "border-zinc-200 bg-zinc-50",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            level === "trusted" && "bg-emerald-100 text-emerald-800",
            level === "good" && "bg-sky-100 text-sky-800",
            level === "new" && "bg-zinc-200 text-zinc-700",
          )}
        >
          {sellerInitials(seller)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1 font-medium text-zinc-900">
              <span className="truncate">{displayName}</span>
              {seller.phoneVerified && (
                <BadgeCheck
                  className="size-4 shrink-0 text-emerald-600"
                  aria-label="Phone verified"
                />
              )}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                level === "trusted" && "bg-emerald-100 text-emerald-800",
                level === "good" && "bg-sky-100 text-sky-800",
                level === "new" && "bg-zinc-200 text-zinc-700",
              )}
            >
              {label}
            </span>
          </div>
          {!compact && (
            <p className="mt-0.5 text-zinc-600">
              ★ {seller.rating.toFixed(1)} · {seller.dealsDone}{" "}
              {seller.dealsDone === 1 ? "deal" : "deals"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
