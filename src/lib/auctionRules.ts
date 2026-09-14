import { BidIncrementSlab, AuctionSettings } from "@/types/auction";

/**
 * Official BCCI IPL Mega & Mini Auction Default Slabs
 * - Up to ₹1 Cr: +₹10 L (or ₹5L for uncapped)
 * - ₹1 Cr to ₹2 Cr: +₹20 L
 * - ₹2 Cr to ₹5 Cr: +₹25 L
 * - Above ₹5 Cr: +₹25 L
 */
export const DEFAULT_IPL_BID_SLABS: BidIncrementSlab[] = [
  { tierName: "Up to ₹1 Cr", minPriceCr: 0, maxPriceCr: 1.0, incrementCr: 0.10 },
  { tierName: "₹1 Cr to ₹2 Cr", minPriceCr: 1.0, maxPriceCr: 2.0, incrementCr: 0.20 },
  { tierName: "₹2 Cr to ₹5 Cr", minPriceCr: 2.0, maxPriceCr: 5.0, incrementCr: 0.25 },
  { tierName: "Above ₹5 Cr", minPriceCr: 5.0, maxPriceCr: Infinity, incrementCr: 0.25 },
];

/**
 * Fast Auction Mode Slabs (Higher Gaps)
 */
export const FAST_AUCTION_SLABS: BidIncrementSlab[] = [
  { tierName: "Up to ₹1 Cr", minPriceCr: 0, maxPriceCr: 1.0, incrementCr: 0.20 },
  { tierName: "₹1 Cr to ₹2 Cr", minPriceCr: 1.0, maxPriceCr: 2.0, incrementCr: 0.25 },
  { tierName: "₹2 Cr to ₹5 Cr", minPriceCr: 2.0, maxPriceCr: 5.0, incrementCr: 0.50 },
  { tierName: "Above ₹5 Cr", minPriceCr: 5.0, maxPriceCr: Infinity, incrementCr: 1.00 },
];

/**
 * Gets the standard single fixed increment for the current price based on configured slabs.
 */
export function getStandardBidIncrement(
  currentBidCr: number,
  slabs: BidIncrementSlab[] = DEFAULT_IPL_BID_SLABS
): number {
  const slab = slabs.find(
    (s) => currentBidCr >= s.minPriceCr && currentBidCr < s.maxPriceCr
  );
  return slab ? slab.incrementCr : 0.25;
}

/**
 * Calculates context-aware IPL bid increments based on current price and settings.
 * If allowJumpBids is true, returns multiple options. Otherwise, returns only the single fixed paddle raise increment.
 */
export function getContextualIncrements(
  currentBidCr: number,
  settings?: AuctionSettings
): { label: string; amountCr: number }[] {
  const slabs = settings?.bidSlabs || DEFAULT_IPL_BID_SLABS;
  const standardInc = getStandardBidIncrement(currentBidCr, slabs);

  const standardOption = {
    label: `+${formatCurrencyCr(standardInc)}`,
    amountCr: standardInc,
  };

  if (!settings?.allowCustomBids && !settings?.allowJumpBids) {
    // Official IPL mode: Strictly ONE fixed paddle increment!
    return [standardOption];
  }

  // Jump bids allowed
  let jump1 = Number((standardInc * 2).toFixed(2));
  let jump2 = Number((standardInc * 4).toFixed(2));

  if (currentBidCr >= 5.0) {
    jump1 = Math.max(standardInc * 2, 0.50);
    jump2 = Math.max(standardInc * 4, 1.00);
  }

  return [
    standardOption,
    { label: `+${formatCurrencyCr(jump1)}`, amountCr: jump1 },
    { label: `+${formatCurrencyCr(jump2)}`, amountCr: jump2 },
  ];
}

/**
 * Formats a Crore amount cleanly for UI display (e.g. ₹16.50 Cr, ₹30 L)
 */
export function formatCurrencyCr(amountCr: number): string {
  if (amountCr < 1.0) {
    const lakhs = Math.round(amountCr * 100);
    return `₹${lakhs} L`;
  }
  return `₹${amountCr.toFixed(2)} Cr`;
}
