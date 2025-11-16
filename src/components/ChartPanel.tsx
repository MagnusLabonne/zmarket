"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import { createChart, ColorType, type IChartApi, type ISeriesApi } from "lightweight-charts";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import type { PriceTick } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const ChartPanel = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi>();
  const seriesRef = useRef<ISeriesApi<"Candlestick">>();
  const { data } = useSWR<PriceTick[]>("/api/price-feed", fetcher);
  const { messages } = useRealtimeFeed<PriceTick>("price");

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#cbd5f5",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.02)" },
        horzLines: { color: "rgba(255,255,255,0.02)" },
      },
      crosshair: {
        mode: 1,
      },
      priceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
    });
    const series = chart.addCandlestickSeries({
      upColor: "#62ffd2",
      borderUpColor: "#62ffd2",
      wickUpColor: "#62ffd2",
      downColor: "#ff6492",
      borderDownColor: "#ff6492",
      wickDownColor: "#ff9bb4",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    const resize = () => {
      chart.applyOptions({ width: containerRef.current?.clientWidth ?? 600 });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!data?.length || !seriesRef.current) return;
    seriesRef.current.setData(
      data.map((tick) => ({
        open: tick.open,
        high: tick.high,
        low: tick.low,
        close: tick.close,
        time: Math.floor(tick.timestamp / 1000),
      })),
    );
  }, [data]);

  useEffect(() => {
    if (!messages.length || !seriesRef.current) return;
    const latest = messages[messages.length - 1];
    seriesRef.current.update({
      open: latest.open,
      high: latest.high,
      low: latest.low,
      close: latest.close,
      time: Math.floor(latest.timestamp / 1000),
    });
  }, [messages]);

  return (
    <div className="glass-panel h-[420px] w-full p-2">
      <div className="w-full h-full" ref={containerRef} />
    </div>
  );
};

