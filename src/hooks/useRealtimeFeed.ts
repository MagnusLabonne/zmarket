"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SocketMessage<T> = {
  type: string;
  payload: T;
};

export const useRealtimeFeed = <T = unknown>(
  filterType?: string,
  predicate?: (payload: T) => boolean,
) => {
  const [messages, setMessages] = useState<T[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const predicateRef = useRef<typeof predicate>();

  useEffect(() => {
    predicateRef.current = predicate;
  }, [predicate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin.replace("http", "ws");
    let isMounted = true;
    const socket = new WebSocket(`${origin}/api/socket`);

    socket.onopen = () => isMounted && setStatus("open");
    socket.onclose = () => isMounted && setStatus("closed");
    socket.onerror = () => isMounted && setStatus("closed");
    socket.onmessage = (event) => {
      try {
        const data: SocketMessage<T> = JSON.parse(event.data);
        if (filterType && data.type !== filterType) return;
        if (predicateRef.current && !predicateRef.current(data.payload)) return;
        setMessages((prev) => [...prev.slice(-99), data.payload]);
      } catch (error) {
        console.error("ws parse", error);
      }
    };

    return () => {
      isMounted = false;
      socket.close();
    };
  }, [filterType]);

  return useMemo(() => ({ messages, status }), [messages, status]);
};

