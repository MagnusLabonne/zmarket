import { serverEnv } from "./env.server";
import {
  simulateBalanceFetch,
  simulateOrderPlacement,
  simulateOrderBook,
  simulateOrderCancel,
} from "./custody-sim";
import { BalanceSnapshot, OrderRequest } from "./types";

type AmplifyPath = "/balances" | "/orders" | "/orderbook";

export const amplifyInvoke = async <T>(
  path: AmplifyPath,
  init: { method?: "GET" | "POST" | "DELETE"; body?: unknown } = {},
): Promise<T> => {
  if (!serverEnv.AMPLIFY_API_BASE_URL) {
    return simulate(path, init) as Promise<T>;
  }

  const response = await fetch(serverEnv.AMPLIFY_API_BASE_URL + path, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": serverEnv.AMPLIFY_API_KEY,
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Amplify error ${response.status}`);
  }

  return (await response.json()) as T;
};

const simulate = async (path: AmplifyPath, init: { method?: string; body?: unknown }) => {
  switch (path) {
    case "/balances": {
      const { wallet } = (init.body ?? {}) as { wallet: string };
      return simulateBalanceFetch(wallet);
    }
    case "/orders": {
      if (init.method === "DELETE") {
        const { orderId, side, market } = (init.body ?? {}) as {
          orderId: string;
          side: "buy" | "sell";
          market?: string;
        };
        await simulateOrderCancel(orderId, side, market);
        return { ok: true };
      }
      return simulateOrderPlacement(init.body as OrderRequest);
    }
    case "/orderbook": {
      const { market } = (init.body ?? {}) as { market?: string };
      return simulateOrderBook(market);
    }
    default:
      return simulateOrderBook();
  }
};

export const syncCustodyBalance = async (wallet: string): Promise<BalanceSnapshot> => {
  return amplifyInvoke<BalanceSnapshot>("/balances", { method: "POST", body: { wallet } });
};

export const submitCustodyOrder = async (payload: OrderRequest) => {
  return amplifyInvoke("/orders", { method: "POST", body: payload });
};

export const cancelCustodyOrder = async (orderId: string, side: "buy" | "sell", market?: string) => {
  return amplifyInvoke("/orders", { method: "DELETE", body: { orderId, side, market } });
};

