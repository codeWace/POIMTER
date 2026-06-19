import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  return NextResponse.json([
    {
      title: `Social buzz about ${query}`,
      mentions: Math.floor(Math.random() * 300),
    },
  ]);
}