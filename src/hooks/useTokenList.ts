"use client";

import useSWR from "swr";
import type { ZrcToken } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTokenList = () => {
  const { data, error, isLoading, mutate } = useSWR<ZrcToken[]>("/api/tokens", fetcher, {
    refreshInterval: 5 * 60 * 1000,
  });

  return {
    tokens: data ?? [],
    loading: isLoading,
    error,
    refresh: mutate,
  };
};

