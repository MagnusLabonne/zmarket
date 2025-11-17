export const DEFAULT_MARKET = "ZRC-SOL";

export const normalizeMarket = (market?: string) => {
  if (!market) return DEFAULT_MARKET;
  return market.trim().toUpperCase();
};

export const marketFromToken = (input?: { inscriptionId?: string; tick?: string }) => {
  if (!input) return DEFAULT_MARKET;
  return normalizeMarket(input.inscriptionId ?? input.tick);
};

