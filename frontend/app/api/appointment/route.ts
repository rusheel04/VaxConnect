import { NextResponse } from "next/server";
import { CalleClient } from "@call-e/calle";

const client = new CalleClient({
    apiKey: process.env.CALLE_API_KEY!,
});

function getTranscriptText(
    call: any
): string {
    const turns =
        call.recipients?.[0]?.attempts?.[0]
            ?.transcriptTurns || [];

    return turns
        .map((turn: any) => {
            if (typeof turn === "string") {
                return turn;
            }

            return (
                turn.text ||
                turn.transcript ||
                turn.content ||
                ""
            );
        })
        .filter(Boolean)
        .join("\n");
}

function extractBookingResult(
    call: any,
    transcript: string
) {
    const text = (
        transcript +
        "\n" +
        (call.summary || "")
    ).toLowerCase();

    /*
     * Strong indicators that the provider explicitly
     * confirmed the appointment.
     */
    const confirmedPatterns = [
        "appointment is booked",
        "appointment has been booked",
        "appointment is confirmed",
        "appointment has been confirmed",
        "booking is confirmed",
        "booking has been confirmed",
        "you are booked",
        "you're booked",
        "scheduled for",
        "appointment booked",
        "appointment confirmed",
    ];

    /*
     * Indicators that the requested appointment could
     * not be booked.
     */
    const notBookedPatterns = [
        "cannot book",
        "can't book",
        "cannot schedule",
        "can't schedule",
        "not available",
        "unable to book",
        "unable to schedule",
        "no appointment",
        "no availability",
    ];

    const confirmed = confirmedPatterns.some(
        (pattern) => text.includes(pattern)
    );

    const notBooked = notBookedPatterns.some(
        (pattern) => text.includes(pattern)
    );

    let booked:
        | "yes"
        | "no"
        | "unknown" = "unknown";

    let status:
        | "confirmed"
        | "not_booked"
        | "unknown" = "unknown";

    if (confirmed && !notBooked) {
        booked = "yes";
        status = "confirmed";
    } else if (notBooked && !confirmed) {
        booked = "no";
        status = "not_booked";
    }

    return {
        booked,
        status,
        confirmed_date: "",
        confirmed_time: "",
        provider_message:
            call.summary ||
            transcript ||
            "No provider response was returned.",
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            patientName,
            patientPhone,
            vaccine,
            hospital,
            preferredDate,
            preferredTime,
        } = body;

        if (
            !patientName ||
            !patientPhone ||
            !vaccine ||
            !hospital ||
            !preferredDate ||
            !preferredTime
        ) {
            return NextResponse.json(
                {
                    error:
                        "Patient name, phone, vaccine, provider, date, and time are required.",
                },
                { status: 400 }
            );
        }

        const providerPhone =
            process.env.DEMO_PROVIDER_PHONE;

        if (!providerPhone) {
            return NextResponse.json(
                {
                    error:
                        "No provider phone number is configured.",
                },
                { status: 500 }
            );
        }

        /*
         * ONE CALL-E BOOKING CALL.
         *
         * The provider phone is the authorized demo/test
         * number configured in DEMO_PROVIDER_PHONE.
         */
        const call = await client.calls.createAndWait(
            {
                task: `
You are an appointment coordinator calling on behalf of VaxConnect.

You are calling ${hospital} to book a vaccination appointment.

Vaccination:
${vaccine}

Patient name:
${patientName}

Patient contact phone number:
${patientPhone}

Requested appointment date:
${preferredDate}

Requested appointment time:
${preferredTime}

Your goal is to determine whether this appointment can actually be booked.

IMPORTANT INSTRUCTIONS:

- Clearly introduce yourself as calling on behalf of VaxConnect.
- Ask to book a ${vaccine} vaccination appointment for ${patientName}.
- Give the provider the requested date and time.
- If that exact time is unavailable, ask whether the provider has another available time on the same date.
- If an alternative is offered, clearly identify the alternative date and time.
- Confirm the patient's name before finalizing the booking.
- Confirm the vaccination type before finalizing the booking.
- You may provide the patient's contact phone number if the provider needs it for the appointment.
- Do not provide medical advice.
- Do not make decisions about medical treatment.
- Do not invent availability, prices, dates, times, or provider policies.
- Do not claim that an appointment is booked unless the provider explicitly confirms the booking.
- Before ending the call, obtain a clear answer about whether the appointment was successfully booked.
- If the provider cannot book the appointment, clearly acknowledge that it was not booked.
- If the provider offers an alternative time, clearly communicate that alternative.
`,
                recipients: [
                    {
                        phones: [providerPhone],
                        region: "IN",
                        locale: "en-IN",
                    },
                ],
                metadata: {
                    workflow: "vaxconnect-appointment",
                    vaccine,
                    hospital,
                },
            },
            {
                idempotencyKey: `vaxconnect-booking-${Date.now()}`,
            }
        );

        const transcript =
            getTranscriptText(call);

        const bookingResult =
            extractBookingResult(
                call,
                transcript
            );

        return NextResponse.json({
            call_id: call.id,
            status: call.status,

            booked: bookingResult.booked,

            booking_result: bookingResult,

            summary: call.summary,

            task_completed:
            call.taskCompleted,

            confidence:
            call.completionConfidence,

            evidence: call.evidence,

            failure_code:
            call.failureCode,

            failure_message:
            call.failureMessage,

            transcript:
                call.recipients?.[0]
                    ?.attempts?.[0]
                    ?.transcriptTurns || [],
        });
    } catch (error) {
        console.error(
            "CALL-E appointment error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Appointment call failed",

                details:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            { status: 500 }
        );
    }
}