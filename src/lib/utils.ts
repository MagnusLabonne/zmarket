export const shortenAddress = (value?: string, size = 4) => {
  if (!value) return "";
  return `${value.slice(0, size + 2)}...${value.slice(-size)}`;
};

export const formatCurrency = (value: number, currency = "USDC") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USDC" ? "USD" : "USD",
    maximumFractionDigits: 2,
  }).format(value);

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);

