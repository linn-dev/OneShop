export type SellerTrust = {
  id: string;
  name: string | null;
  email: string;
  phoneVerified: boolean;
  rating: number;
  dealsDone: number;
};

export type TrustLevel = "new" | "good" | "trusted";

export function trustLevel(seller: Pick<SellerTrust, "phoneVerified" | "rating" | "dealsDone">): TrustLevel {
  if (seller.dealsDone === 0 && !seller.phoneVerified) return "new";
  if (seller.phoneVerified && seller.rating >= 4.5 && seller.dealsDone >= 3) return "trusted";
  return "good";
}

export function trustLabel(level: TrustLevel): string {
  if (level === "trusted") return "Trusted seller";
  if (level === "good") return "Verified seller";
  return "New seller";
}
