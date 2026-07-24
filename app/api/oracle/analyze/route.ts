import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    if (
      typeof input !== "object" ||
      input === null ||
      !("sessionId" in input) ||
      typeof input.sessionId !== "string" ||
      !input.sessionId
    ) {
      return NextResponse.json(
        {
          error:
            "Oracle analysis requires an authoritative completed Session identity.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Session Report runtime activation is not authorised in this environment.",
      },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError
            ? "Oracle analysis request must be valid JSON."
            : "Oracle analysis request could not be accepted.",
      },
      { status: 400 }
    );
  }
}
