import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const callId = url.searchParams.get("callId");

    if (!callId) {
      return NextResponse.json(
        { error: "callId is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CALLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "CALLE_API_KEY is missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.heycall-e.com/v1/calls/${encodeURIComponent(callId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("CALL-E status fetch failed:", response.status, data);
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("CALL-E status error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}