import { NextResponse } from "next/server";
import { CalleClient } from "@call-e/calle";

export async function POST(req: Request) {
  try {
    const { vaccines } = (await req.json()) as {
      vaccines: string[];
    };

    if (!vaccines || vaccines.length === 0) {
      return NextResponse.json(
        { error: "No vaccines provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CALLE_API_KEY;
    const phone = process.env.CALLE_TEST_PHONE;

    if (!apiKey) {
      return NextResponse.json(
        { error: "CALLE_API_KEY is missing" },
        { status: 500 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "CALLE_TEST_PHONE is missing" },
        { status: 500 }
      );
    }

    const client = new CalleClient({
      apiKey,
    });

    const call = await client.calls.create({
      task: `Call the authorized test recipient and ask about vaccine availability.

The vaccines we are checking are: ${vaccines.join(", ")}.

Explain that you are calling from VaxConnect.
Ask whether these vaccines are currently available.
Be polite and clearly summarize the answer.`,
      recipients: [
        {
          phones: [phone],
        },
      ],
    });

    console.log("CALL-E call created:", call);

    if (!call?.id) {
      console.error("CALL-E did not return a call id:", call);
      return NextResponse.json(
        { error: "CALL-E did not return a call id" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      callId: call.id,
      message: "CALL-E call started successfully.",
    });
  } catch (error) {
    console.error("CALL-E ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown CALL-E error",
      },
      { status: 500 }
    );
  }
}