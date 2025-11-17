"use client";

import useSWR from "swr";
import { useCallback, useEffect } from "react";
import { useRealtimeFeed } from "./useRealtimeFeed";
import type { OrderBookLevel } from "@/lib/types";

type OrderBookResponse = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
};

type OrderbookEvent = {
  market: string;
  book: OrderBookResponse;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useOrderBook = (market?: string) => {
  const path = market ? `/api/orderbook?market=${market}` : "/api/orderbook";
  const filter = useCallback(
    (payload: OrderbookEvent) => (market ? payload.market === market : true),
    [market],
  );
  const { data, error, mutate } = useSWR<OrderBookResponse>(path, fetcher, {
    refreshInterval: 15000,
  });
  const { messages } = useRealtimeFeed<OrderbookEvent>("orderbook", filter);

  useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    mutate(latest.book, { revalidate: false });
  }, [messages, mutate]);

  return {
    orderbook: data,
    loading: !data && !error,
    error,
    refresh: () => mutate(),
  };
};

