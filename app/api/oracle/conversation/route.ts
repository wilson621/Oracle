import { NextResponse } from "next/server";
import {
  hasAuthenticatedConversationAuthority,
} from "@/lib/oracle/applications/conversation/server-conversation-authority";

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    if (
      typeof input !== "object" ||
      input === null ||
      !("requestId" in input) ||
      typeof input.requestId !== "string" ||
      !input.requestId.trim() ||
      !("text" in input) ||
      typeof input.text !== "string" ||
      !input.text.trim() ||
      input.text.length > 2_000
    ) {
      return NextResponse.json(
        { error: "Oracle conversation request is invalid." },
        { status: 400 }
      );
    }

    if (!(await hasAuthenticatedConversationAuthority())) {
      return NextResponse.json(
        { error: "Authentication is required to ask Oracle." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Grounded Conversation is implemented and certified, but persisted source consumers remain inactive in this environment.",
      },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError
            ? "Oracle conversation request must be valid JSON."
            : "Oracle conversation request could not be accepted.",
      },
      { status: 400 }
    );
  }
}
