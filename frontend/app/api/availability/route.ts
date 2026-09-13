import { NextResponse } from "next/server";
import { CalleClient } from "@call-e/calle";

type TranscriptTurn = {
    speaker?: string;
    text?: string;
};

type AvailabilityResult = {
    available: boolean;
    price: string;
    appointment_required: string;
    earliest_availability: string;
};

function extractAvailability(result: any): AvailabilityResult {
    const recipient = result?.recipients?.[0];
    const attempt = recipient?.attempts?.[0];

    const turns =
        (attempt?.transcriptTurns ?? []) as TranscriptTurn[];

    let available = false;
    let price = "Not provided";
    let appointmentRequired = "Unknown";
    let earliestAvailability = "Not provided";

    for (let i = 0; i < turns.length; i++) {
        const current = turns[i];

        if (
            current.speaker !== "bot" ||
            !current.text
        ) {
            continue;
        }

        const question = current.text.toLowerCase();

        let answer = "";

        for (let j = i + 1; j < turns.length; j++) {
            if (
                turns[j].speaker === "user" &&
                turns[j].text
            ) {
                answer = String(
                    turns[j].text ?? ""
                ).trim();

                break;
            }
        }

        if (!answer) {
            continue;
        }

        const answerLower =
            answer.toLowerCase();

        if (
            question.includes(
                "currently available"
            )
        ) {
            if (
                answerLower.includes(
                    "not available"
                ) ||
                answerLower.includes(
                    "unavailable"
                ) ||
                answerLower === "no" ||
                answerLower.startsWith("no ")
            ) {
                available = false;
            } else if (
                answerLower.includes(
                    "available"
                ) ||
                answerLower === "yes" ||
                answerLower.startsWith("yes ")
            ) {
                available = true;
            }
        }

        if (
            question.includes(
                "what is the price"
            ) ||
            question.includes("price")
        ) {
            const priceMatch =
                answer.match(
                    /₹\s?[\d,]+(?:\.\d+)?|Rs\.?\s?[\d,]+(?:\.\d+)?|\b\d+(?:,\d+)*(?:\.\d+)?\s?(?:rupees|rs)\b/i
                );

            price =
                priceMatch?.[0] ??
                answer;
        }

        if (
            question.includes(
                "appointment required"
            ) ||
            question.includes("walk-in") ||
            question.includes("walk in")
        ) {
            if (
                answerLower.includes(
                    "appointment"
                )
            ) {
                appointmentRequired =
                    answer;
            } else if (
                answerLower.includes(
                    "walk-in"
                ) ||
                answerLower.includes(
                    "walk in"
                )
            ) {
                appointmentRequired =
                    "Walk-in";
            } else {
                appointmentRequired =
                    answer;
            }
        }

        if (
            question.includes(
                "earliest available"
            )
        ) {
            earliestAvailability =
                answer;
        }
    }

    const summary =
        typeof result?.summary ===
        "string"
            ? result.summary
            : "";

    const summaryLower =
        summary.toLowerCase();

    if (
        !available &&
        summaryLower.includes(
            "available"
        ) &&
        !summaryLower.includes(
            "not available"
        ) &&
        !summaryLower.includes(
            "unavailable"
        )
    ) {
        available = true;
    }

    if (
        price === "Not provided"
    ) {
        const summaryPrice =
            summary.match(
                /₹\s?[\d,]+(?:\.\d+)?|Rs\.?\s?[\d,]+(?:\.\d+)?|\b\d+(?:,\d+)*(?:\.\d+)?\s?(?:rupees|rs)\b/i
            );

        if (summaryPrice) {
            price =
                summaryPrice[0];
        }
    }

    if (
        appointmentRequired ===
        "Unknown"
    ) {
        if (
            summaryLower.includes(
                "appointment is required"
            ) ||
            summaryLower.includes(
                "appointment required"
            )
        ) {
            appointmentRequired =
                "Yes";
        } else if (
            summaryLower.includes(
                "walk-in"
            ) ||
            summaryLower.includes(
                "walk in"
            )
        ) {
            appointmentRequired =
                "Walk-in";
        }
    }

    if (
        earliestAvailability ===
        "Not provided"
    ) {
        const timeMatch =
            summary.match(
                /(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^.]*/i
            );

        if (timeMatch) {
            earliestAvailability =
                timeMatch[0].trim();
        }
    }

    return {
        available,
        price,
        appointment_required:
            appointmentRequired,
        earliest_availability:
            earliestAvailability,
    };
}

async function makeAvailabilityCall(
    client: CalleClient,
    providerPhone: string,
    vaccine: string,
    pinCode: string
) {
    const task = `
You are calling a vaccination provider on behalf of VaxConnect.

This is an AVAILABILITY enquiry only.

Do NOT make an appointment.
Do NOT book anything.
Do NOT provide medical advice.

The vaccine the user wants information about is:

${vaccine}

Ask the provider these questions:

1. Is the ${vaccine} vaccine currently available?
2. What is the price?
3. Is an appointment required, or is walk-in vaccination possible?
4. What is the earliest available vaccination date and time?

Ask the questions naturally and clearly.

Important rules:

- Do not mention the user's PIN code.
- Only report information the provider actually gives you.
- Never guess availability.
- Never guess the price.
- Never guess appointment requirements.
- Never guess dates or times.
- If the provider does not know an answer, report it as unknown.
- Do not make or confirm an appointment.
- This call is only an availability enquiry.

After collecting the information, thank the provider and end the call.
`;

    return await client.calls.createAndWait(
        {
            task,

            recipients: [
                {
                    phones: [
                        providerPhone,
                    ],
                    region: "IN",
                    locale: "en-IN",
                },
            ],

            metadata: {
                application:
                    "vaxconnect",
                operation:
                    "availability",
                vaccine,
                pinCode,
            },
        },
        {
            idempotencyKey:
                `vaxconnect-availability-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`,
        }
    );
}

export async function POST(
    request: Request
) {
    try {
        const body =
            await request.json();

        const vaccine =
            typeof body.vaccine ===
            "string"
                ? body.vaccine.trim()
                : "";

        const pinCode =
            typeof body.pinCode ===
            "string"
                ? body.pinCode.trim()
                : "";

        /*
         * Use the same real CALL-E test
         * phone that was used successfully
         * during your earlier CALL-E testing.
         *
         * The browser can optionally send
         * providerPhone, but normally we use
         * the server-side environment variable.
         */
        const providerPhone =
            typeof body.providerPhone ===
            "string" &&
            body.providerPhone.trim()
                ? body.providerPhone.trim()
                : process.env
                      .CALLE_TEST_PHONE
                      ?.trim() ?? "";

        if (!vaccine) {
            return NextResponse.json(
                {
                    error:
                        "Vaccine is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !/^\d{6}$/.test(
                pinCode
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "A valid 6-digit PIN code is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!providerPhone) {
            return NextResponse.json(
                {
                    error:
                        "CALLE_TEST_PHONE is not configured in .env.",
                },
                {
                    status: 500,
                }
            );
        }

        if (
            !/^\+[1-9]\d{7,14}$/.test(
                providerPhone
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "CALLE_TEST_PHONE must be a valid E.164 phone number, for example +919876543210.",
                },
                {
                    status: 500,
                }
            );
        }

        const apiKey =
            process.env.CALLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "CALLE_API_KEY is not configured.",
                },
                {
                    status: 500,
                }
            );
        }

        const baseUrl =
            process.env.CALLE_BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                {
                    error:
                        "CALLE_BASE_URL is not configured.",
                },
                {
                    status: 500,
                }
            );
        }

        const client =
            new CalleClient({
                apiKey,
                baseUrl,
            });

        console.log(
            "========== CALL-E AVAILABILITY ATTEMPT 1 =========="
        );

        let result =
            await makeAvailabilityCall(
                client,
                providerPhone,
                vaccine,
                pinCode
            );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

        if (
            result.status ===
            "failed"
        ) {
            const failureCode =
                result.failureCode ??
                result
                    .recipients?.[0]
                    ?.attempts?.[0]
                    ?.failureCode ??
                null;

            console.log(
                `CALL-E first attempt failed with ${failureCode}. Retrying once...`
            );

            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        2000
                    )
            );

            console.log(
                "========== CALL-E AVAILABILITY ATTEMPT 2 =========="
            );

            result =
                await makeAvailabilityCall(
                    client,
                    providerPhone,
                    vaccine,
                    pinCode
                );

            console.log(
                JSON.stringify(
                    result,
                    null,
                    2
                )
            );
        }

        if (
            result.status ===
            "failed"
        ) {
            return NextResponse.json(
                {
                    error:
                        "CALL-E call failed after retry.",

                    call: {
                        id:
                            result.id ??
                            null,

                        status:
                            result.status ??
                            null,

                        failureCode:
                            result.failureCode ??
                            result
                                .recipients?.[0]
                                ?.attempts?.[0]
                                ?.failureCode ??
                            null,

                        failureMessage:
                            result.failureMessage ??
                            result
                                .recipients?.[0]
                                ?.attempts?.[0]
                                ?.failureMessage ??
                            null,

                        summary:
                            result.summary ??
                            null,
                    },
                },
                {
                    status: 502,
                }
            );
        }

        if (
            result.status !==
                "completed" ||
            !result.taskCompleted
        ) {
            return NextResponse.json(
                {
                    error:
                        "CALL-E did not complete the availability enquiry.",

                    call: {
                        id:
                            result.id ??
                            null,

                        status:
                            result.status ??
                            null,

                        taskCompleted:
                            result.taskCompleted ??
                            null,

                        summary:
                            result.summary ??
                            null,
                    },
                },
                {
                    status: 502,
                }
            );
        }

        const availability =
            extractAvailability(
                result
            );

        /*
         * Return one real provider result.
         * No fake/demo providers.
         */
        const provider = {
            hospital:
                "CALL-E Contacted Provider",

            provider_id:
                result.id ??
                providerPhone,

            available:
                availability.available,

            price:
                availability.price,

            appointment_required:
                availability.appointment_required,

            earliest_availability:
                availability.earliest_availability,

            source:
                "CALL-E VERIFIED" as const,
        };

        return NextResponse.json({
            success: true,

            vaccine,

            pinCode,

            provider: {
                phone:
                    providerPhone,
            },

            availability,

            /*
             * The page expects providers,
             * so give it one real CALL-E
             * provider result.
             */
            providers: [
                provider,
            ],

            call: {
                id:
                    result.id ??
                    null,

                status:
                    result.status ??
                    null,

                taskCompleted:
                    result.taskCompleted ??
                    null,

                summary:
                    result.summary ??
                    null,
            },
        });
    } catch (error) {
        console.error(
            "========== CALL-E AVAILABILITY EXCEPTION =========="
        );

        console.error(error);

        console.error(
            "===================================================="
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to execute CALL-E availability enquiry.",
            },
            {
                status: 500,
            }
        );
    }
}