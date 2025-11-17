import { NextResponse } from "next/server";
import { fetchTokenList } from "@/lib/tokens";

export const revalidate = 300;

export async function GET() {
  const tokens = await fetchTokenList();
  return NextResponse.json(tokens);
}

