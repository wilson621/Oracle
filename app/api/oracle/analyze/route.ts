import { NextResponse } from "next/server";
import { analyseFight } from "@/lib/oracle";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const report = await analyseFight(prompt);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("ORACLE API ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}