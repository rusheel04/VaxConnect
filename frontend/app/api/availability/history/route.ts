import { NextResponse } from "next/server";

const SUCCESSFUL_CALL_IDS = [
  "1c76a4a73bad41c1b6b125cf7098f663",
  "6bbe7d80bbc14adabd927f01ac1bd352",
  "8cf032c64d664e04ad1d741ac27eea07",
];

export async function GET() {
  try {
    const apiKey = process.env.CALLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "CALLE_API_KEY is missing" },
        { status: 500 }
      );
    }

    const calls = await Promise.all(
      SUCCESSFUL_CALL_IDS.map(async (callId) => {
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

        if (!response.ok) {
          console.error(
            `CALL-E could not fetch ${callId}:`,
            response.status
          );
          return null;
        }

        return await response.json();
      })
    );

    return NextResponse.json({
      success: true,
      calls: calls.filter(Boolean),
    });
  } catch (error) {
    console.error("CALL-E HISTORY ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load CALL-E history",
      },
      { status: 500 }
    );
  }
}