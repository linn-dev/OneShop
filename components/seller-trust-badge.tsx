import { BadgeCheck } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { trustLabel, trustLevel, type SellerTrust } from "@/lib/trust";
import { cn } from "@/lib/utils";

export function SellerTrustBadge({
  seller,
  compact = false,
  showAvatar = true,
}: {
  seller: SellerTrust;
  compact?: boolean;
  showAvatar?: boolean;
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
        {showAvatar && (
          <UserAvatar
            src={seller.image}
            alt={displayName}
            size="md"
          />
        )}
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
