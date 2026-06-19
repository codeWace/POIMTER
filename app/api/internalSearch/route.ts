import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  return NextResponse.json([
    {
      id: "internal-1",
      summary: `${query} demand analysis generated from internal DB`,
    },
  ]);
}