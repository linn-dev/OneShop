import { trustLabel, trustLevel, type SellerTrust } from "@/lib/trust";
import { cn } from "@/lib/utils";

export function SellerTrustBadge({
  seller,
  compact = false,
}: {
  seller: SellerTrust;
  compact?: boolean;
}) {
  const level = trustLevel(seller);
  const label = trustLabel(level);

  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm",
        level === "trusted" && "border-emerald-200 bg-emerald-50",
        level === "good" && "border-sky-200 bg-sky-50",
        level === "new" && "border-zinc-200 bg-zinc-50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-zinc-900">{seller.name || seller.email}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            level === "trusted" && "bg-emerald-100 text-emerald-800",
            level === "good" && "bg-sky-100 text-sky-800",
            level === "new" && "bg-zinc-200 text-zinc-700",
          )}
        >
          {label}
        </span>
      </div>
      {!compact && (
        <p className="mt-1 text-zinc-600">
          ★ {seller.rating.toFixed(1)} · {seller.dealsDone} {seller.dealsDone === 1 ? "deal" : "deals"}
          {seller.phoneVerified ? " · Phone verified" : ""}
        </p>
      )}
    </div>
  );
}
