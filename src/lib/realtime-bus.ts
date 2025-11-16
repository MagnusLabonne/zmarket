type EventPayload<T = unknown> = {
  type: "orderbook" | "price";
  payload: T;
};

type Listener = (event: EventPayload) => void;

const listeners = new Set<Listener>();

export const publishRealtimeEvent = (event: EventPayload) => {
  listeners.forEach((listener) => listener(event));
};

export const subscribeRealtimeEvent = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

