import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  // MOCK REAL TREND DATA (replace later with Google Trends API)
  return NextResponse.json([
    { value: Math.random() * 100 },
    { value: Math.random() * 100 },
    { value: Math.random() * 100 },
  ]);
}