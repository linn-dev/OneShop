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

/**
 * Placeholder rating until buyers can leave reviews.
 * Bayesian average: 4.8 prior from 2 hypothetical reviews, each completed deal counts as 5.0.
 */
export function placeholderRating(dealsDone: number): number {
  const priorCount = 2;
  const priorAvg = 4.8;
  const dealScore = 5.0;
  const n = Math.max(0, dealsDone);
  const rating = (priorAvg * priorCount + dealScore * n) / (priorCount + n);
  return Math.round(rating * 10) / 10;
}
