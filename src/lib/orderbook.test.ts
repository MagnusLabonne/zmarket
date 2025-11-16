import { beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";

const mockRedis = (() => {
  const zsets = new Map<string, { score: number; member: string }[]>();
  const hashes = new Map<string, Record<string, string>>();
  const strings = new Map<string, string>();
  const sets = new Map<string, Set<string>>();

  return {
    reset() {
      zsets.clear();
      hashes.clear();
      strings.clear();
      sets.clear();
    },
    zadd(key: string, value: { score: number; member: string }) {
      const arr = zsets.get(key) ?? [];
      arr.push(value);
      zsets.set(key, arr);
      return Promise.resolve();
    },
    zrange(
      key: string,
      start: number,
      end: number,
      opts?: { rev?: boolean; withScores?: boolean },
    ) {
      const arr = (zsets.get(key) ?? []).slice();
      arr.sort((a, b) => (opts?.rev ? b.score - a.score : a.score - b.score));
      const sliced = arr.slice(start, end === 0 ? 1 : end + 1);
      if (opts?.withScores) {
        return Promise.resolve(
          sliced.flatMap((entry) => [entry.member, entry.score]),
        );
      }
      return Promise.resolve(sliced.map((entry) => entry.member));
    },
    zrem(key: string, member: string) {
      const arr = zsets.get(key) ?? [];
      zsets.set(
        key,
        arr.filter((entry) => entry.member !== member),
      );
      return Promise.resolve();
    },
    hget<T>(key: string, field: string) {
      const hash = hashes.get(key);
      return Promise.resolve((hash?.[field] as T) ?? null);
    },
    hset(key: string, value: Record<string, string>) {
      const hash = hashes.get(key) ?? {};
      Object.assign(hash, value);
      hashes.set(key, hash);
      return Promise.resolve();
    },
    set(key: string, value: string) {
      strings.set(key, value);
      return Promise.resolve();
    },
    get<T>(key: string) {
      return Promise.resolve((strings.get(key) as T) ?? null);
    },
    sadd(key: string, member: string) {
      const set = sets.get(key) ?? new Set<string>();
      set.add(member);
      sets.set(key, set);
      return Promise.resolve();
    },
    smembers<T>(key: string) {
      return Promise.resolve(Array.from((sets.get(key) ?? new Set()) as Set<T>));
    },
    srem(key: string, member: string) {
      const set = sets.get(key);
      set?.delete(member);
      return Promise.resolve();
    },
  };
})();

vi.stubGlobal("crypto", webcrypto as unknown as Crypto);

vi.mock("./upstash", () => ({
  getRedis: () => mockRedis,
  orderBookKey: (market: string, side: string) => `orderbook:${market}:${side}`,
  balanceKey: (wallet: string) => `balance:${wallet}`,
}));

import { getOrderBook, placeOrder } from "./orderbook";

describe("orderbook helpers", () => {
  beforeEach(() => {
    mockRedis.reset();
  });

  it("aggregates depth for bids and asks", async () => {
    await placeOrder({ wallet: "alice", side: "buy", type: "limit", price: 140, size: 1 });
    await placeOrder({ wallet: "bob", side: "buy", type: "limit", price: 139, size: 2 });
    await placeOrder({ wallet: "carol", side: "sell", type: "limit", price: 141, size: 1.5 });

    const book = await getOrderBook();
    expect(book.bids[0].price).toBe(140);
    expect(book.bids[0].size).toBeCloseTo(1);
    expect(book.asks[0].price).toBe(141);
    expect(book.asks[0].size).toBeCloseTo(1.5);
  });
});

