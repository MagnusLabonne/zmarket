export type OrderSide = "buy" | "sell";
export type OrderType = "limit" | "market";

export interface BalanceSnapshot {
  wallet: string;
  usdc: number;
  zrc: number;
  updatedAt: string;
}

export interface OrderRequest {
  wallet: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  size: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderSnapshot extends OrderRequest {
  id: string;
  status: "open" | "filled" | "cancelled" | "partial";
  filledSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface TradeFill {
  id: string;
  taker: string;
  maker: string;
  price: number;
  size: number;
  side: OrderSide;
  createdAt: string;
}

export interface PriceTick {
  id: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface CustodyNotice {
  chain: "solana" | "zcash";
  depositAddress: string;
  hotWallet: string;
  status: "online" | "delayed" | "maintenance";
}

