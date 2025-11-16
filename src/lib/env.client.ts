import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1, "WalletConnect project id missing"),
});

const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});

export const clientEnv = {
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    (parsedClient.success && parsedClient.data.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) || "",
};

