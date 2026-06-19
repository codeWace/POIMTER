import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  return NextResponse.json([
    {
      text: `People discussing ${query} heavily online`,
    },
    {
      text: `${query} sentiment rising in communities`,
    },
  ]);
}