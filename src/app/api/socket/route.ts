import { NextRequest } from "next/server";
import { subscribeRealtimeEvent } from "@/lib/realtime-bus";
import { simulateOrderBook } from "@/lib/custody-sim";
import { fetchRecentTicks } from "@/lib/prices";
import { DEFAULT_MARKET } from "@/lib/market";

export const runtime = "edge";

type ServerSocket = WebSocket & { isAlive?: boolean; accept: () => void };

const sockets = new Set<ServerSocket>();

const unsubscribe = subscribeRealtimeEvent((event) => {
  const message = JSON.stringify(event);
  sockets.forEach((socket) => {
    try {
      socket.send(message);
    } catch {
      sockets.delete(socket);
    }
  });
});

async function primeSocket(socket: ServerSocket) {
  const market = DEFAULT_MARKET;
  const [orderbook, ticks] = await Promise.all([simulateOrderBook(market), fetchRecentTicks(market)]);
  socket.send(JSON.stringify({ type: "orderbook", payload: { market, book: orderbook } }));
  if (ticks.length) {
    socket.send(JSON.stringify({ type: "price", payload: { market, tick: ticks[ticks.length - 1] } }));
  }
}

export async function GET(request: NextRequest) {
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 400 });
  }

  const globalScope = globalThis as typeof globalThis & {
    WebSocketPair?: { new (): { 0: ServerSocket; 1: ServerSocket } };
  };
  const WebSocketPairCtor = globalScope.WebSocketPair;
  if (!WebSocketPairCtor) {
    throw new Error("WebSocketPair is not supported in this runtime");
  }
  const pair = new WebSocketPairCtor();
  const client = pair[0] as ServerSocket;
  const server = pair[1] as ServerSocket;

  server.accept();
  server.isAlive = true;
  sockets.add(server);
  primeSocket(server);

  server.addEventListener("message", () => {
    server.isAlive = true;
  });

  server.addEventListener("close", () => {
    sockets.delete(server);
  });
  server.addEventListener("error", () => {
    sockets.delete(server);
  });

  return new Response(null, { status: 101, webSocket: client });
}

export function cleanup() {
  unsubscribe();
  sockets.forEach((socket) => socket.close());
  sockets.clear();
}

