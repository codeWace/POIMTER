import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { internalData, externalData } = await req.json();

  const totalMentions = externalData.reduce(
    (sum: number, x: any) => sum + (x.mentions || 0),
    0
  );

  const internalScore = internalData.length * 10;

  const base = Math.min(100, totalMentions / 10 + internalScore);

  return NextResponse.json([
    {
      id: "NG",
      label: "Nigeria",

      lat: 9.082,
      lng: 8.675,

      value: base,

      drivers: ["social signal", "internal demand"],

      insight: "AI-adjusted demand from live signals",
    },

    {
      id: "KE",
      label: "Kenya",

      lat: -0.0236,
      lng: 37.9062,

      value: base * 0.8,

      drivers: ["regional diffusion"],

      insight: "Secondary demand cluster detected",
    },
  ]);
}