"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { useRealtimeFeed } from "./useRealtimeFeed";
import type { OrderBookLevel } from "@/lib/types";

type OrderBookResponse = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useOrderBook = () => {
  const { data, error, mutate } = useSWR<OrderBookResponse>("/api/orderbook", fetcher, {
    refreshInterval: 15000,
  });
  const { messages } = useRealtimeFeed<OrderBookResponse>("orderbook");

  useEffect(() => {
    if (!messages.length) return;
    mutate(messages[messages.length - 1], { revalidate: false });
  }, [messages, mutate]);

  return {
    orderbook: data,
    loading: !data && !error,
    error,
    refresh: () => mutate(),
  };
};

