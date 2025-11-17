"use client";

import { useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import type { PriceTick } from "@/lib/types";
import { useTokenSelection } from "@/context/token-context";

type PriceEvent = {
  market: string;
  tick: PriceTick;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const ChartPanel = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi>();
  const seriesRef = useRef<ISeriesApi<"Candlestick">>();
  const { marketId } = useTokenSelection();
  const { data } = useSWR<PriceTick[]>(marketId ? `/api/price-feed?market=${marketId}` : null, fetcher);
  const priceFilter = useCallback((payload: PriceEvent) => payload.market === marketId, [marketId]);
  const { messages } = useRealtimeFeed<PriceEvent>("price", priceFilter);

  useEffect(() => {
    let chart: IChartApi | undefined;
    let resize: (() => void) | undefined;

    const init = async () => {
      if (!containerRef.current || chartRef.current) return;
      const { createChart, ColorType } = await import("lightweight-charts");

      chart = createChart(containerRef.current, {
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

      resize = () => {
        chart?.applyOptions({ width: containerRef.current?.clientWidth ?? 600 });
      };
      resize();
      window.addEventListener("resize", resize);
    };

    init();

    return () => {
      if (resize) window.removeEventListener("resize", resize);
      chart?.remove();
      chartRef.current = undefined;
      seriesRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (!data?.length) {
      seriesRef.current.setData([]);
      return;
    }
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
    const latest = messages[messages.length - 1].tick;
    seriesRef.current.update({
      open: latest.open,
      high: latest.high,
      low: latest.low,
      close: latest.close,
      time: Math.floor(latest.timestamp / 1000),
    });
  }, [messages]);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData([]);
  }, [marketId]);

  return (
    <div className="glass-panel h-[360px] w-full p-1.5">
      <div className="w-full h-full" ref={containerRef} />
    </div>
  );
};

