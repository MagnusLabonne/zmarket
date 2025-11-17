import { cache } from "react";
import type { ZrcToken } from "./types";
import { marketFromToken } from "./market";

const TOKEN_API_URL = "https://token-api.zerdinals.com/zrc20/token/token-list/all";

type TokenApiShape = {
  tick: string;
  supply: number;
  limit: number;
  mintedAmount: number;
  isMinted: boolean;
  inscription_id: string;
  holders: number;
  deployer: string;
  time: number;
  block: number;
  completedBlock: number;
  txid: string;
};

const mapToken = (token: TokenApiShape): ZrcToken => ({
  tick: token.tick,
  supply: token.supply,
  limit: token.limit,
  mintedAmount: token.mintedAmount,
  isMinted: token.isMinted,
  inscriptionId: token.inscription_id,
  holders: token.holders,
  deployer: token.deployer,
  time: token.time,
  block: token.block,
  completedBlock: token.completedBlock,
  txid: token.txid,
});

const extractTokenArray = (payload: unknown): TokenApiShape[] => {
  if (Array.isArray(payload)) {
    return payload as TokenApiShape[];
  }

  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;

    const directCandidates = [
      root.data,
      root.tokens,
      root.result,
    ];

    for (const candidate of directCandidates) {
      if (Array.isArray(candidate)) {
        return candidate as TokenApiShape[];
      }
    }

    const nested = [
      (root.data as Record<string, unknown> | undefined)?.data,
      (root.data as Record<string, unknown> | undefined)?.results,
      (root.data as Record<string, unknown> | undefined)?.tokens,
      (root.result as Record<string, unknown> | undefined)?.data,
      (root.result as Record<string, unknown> | undefined)?.results,
    ];

    for (const candidate of nested) {
      if (Array.isArray(candidate)) {
        return candidate as TokenApiShape[];
      }
    }
  }

  return [];
};

export const fetchTokenList = cache(async (): Promise<ZrcToken[]> => {
  const res = await fetch(TOKEN_API_URL, {
    next: { revalidate: 60 * 5 },
  });

  if (!res.ok) {
    console.warn("[tokens] upstream error", res.status);
    return [];
  }

  const payload = await res.json();
  const raw = extractTokenArray(payload);
  if (!raw.length) {
    console.warn("[tokens] empty token payload", payload);
    return [];
  }
  return raw.map(mapToken);
});

export const buildTokenLabel = (token: ZrcToken) =>
  `${token.tick.toUpperCase()} - ${token.inscriptionId.slice(0, 6)}...${token.inscriptionId.slice(-4)}`;

export const extractMarketFromToken = (token?: ZrcToken) => marketFromToken(token);

