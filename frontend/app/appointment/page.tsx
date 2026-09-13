"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useFlow } from "@/context/flow-context";
import { addCallHistory } from "@/context/call-history";

export default function AppointmentPage() {
    const router = useRouter();

    const {
        selectedVaccine,
        selectedProvider,
    } = useFlow();

    const [patientName, setPatientName] =
        useState("");

    const [patientPhone, setPatientPhone] =
        useState("");

    const [preferredDate, setPreferredDate] =
        useState("");

    const [preferredTime, setPreferredTime] =
        useState("");

    const [error, setError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    /*
     * No provider selected.
     */
    if (!selectedProvider) {
        return (
            <AppShell>
                <div className="mb-8">
                    <p className="text-xs text-teal font-medium tracking-wide mb-2">
                        VAXCONNECT · APPOINTMENT
                    </p>

                    <h1 className="font-display text-3xl text-ink mb-2">
                        Book Appointment
                    </h1>

                    <p className="text-sm text-ink/60 max-w-2xl leading-relaxed">
                        Please select a provider from the
                        availability results before booking.
                    </p>
                </div>

                <button
                    onClick={() =>
                        router.push("/availability")
                    }
                    className="bg-teal text-white rounded-md px-5 py-2.5 text-sm font-medium hover:bg-teal-dark"
                >
                    Back to Availability →
                </button>
            </AppShell>
        );
    }

    async function handleBooking(
        event: React.FormEvent
    ) {
        event.preventDefault();

        setError("");

        if (!patientName.trim()) {
            setError(
                "Please enter the name under which the appointment should be booked."
            );
            return;
        }

        if (!/^\d{10}$/.test(patientPhone)) {
            setError(
                "Please enter a valid 10-digit phone number."
            );
            return;
        }

        if (!preferredDate) {
            setError(
                "Please select a preferred date."
            );
            return;
        }

        if (!preferredTime) {
            setError(
                "Please select a preferred time."
            );
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(
                "/api/appointment",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        patientName:
                            patientName.trim(),
                        patientPhone,
                        vaccine: selectedVaccine,
                        hospital:
                        selectedProvider.hospital,
                        preferredDate,
                        preferredTime,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.details ||
                    data.error ||
                    "Appointment booking failed."
                );
            }

            /*
             * Only continue if the backend determined that
             * the provider explicitly confirmed the booking.
             */
            if (
                data.booking_result?.booked !==
                "yes"
            ) {
                throw new Error(
                    data.booking_result
                        ?.provider_message ||
                    "The appointment was not confirmed by the provider."
                );
            }

            /*
             * Save the confirmed appointment to Booking History.
             */
            addCallHistory({
                type: "appointment",
                vaccine: selectedVaccine,
                hospital:
                selectedProvider.hospital,
                status: "Appointment Booked",
                summary:
                    data.booking_result
                        ?.provider_message ||
                    data.summary ||
                    `Appointment booked for ${patientName.trim()} on ${preferredDate} at ${preferredTime}.`,
            });

            router.push("/history");
        } catch (error) {
            console.error(
                "Appointment booking error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to book the appointment."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppShell>
            {/* HEADER */}

            <div className="mb-8">
                <p className="text-xs text-teal font-medium tracking-wide mb-2">
                    VAXCONNECT · APPOINTMENT
                </p>

                <h1 className="font-display text-3xl text-ink mb-2">
                    Book Appointment
                </h1>

                <p className="text-sm text-ink/60 max-w-2xl leading-relaxed">
                    Tell us who the appointment is
                    for and when you would like to
                    visit the provider.
                </p>
            </div>

            {/* SELECTED PROVIDER */}

            <div className="max-w-3xl border border-teal/30 bg-teal/5 rounded-xl p-6 mb-6">
                <p className="text-xs text-teal font-medium tracking-wide mb-3">
                    SELECTED PROVIDER
                </p>

                <h2 className="font-display text-2xl text-ink">
                    🏥 {selectedProvider.hospital}
                </h2>

                <p className="text-sm text-ink/60 mt-2">
                    💉 {selectedVaccine}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                    <div>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wide mb-1">
                            Price
                        </p>

                        <p className="text-sm font-medium text-ink">
                            {selectedProvider.price}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wide mb-1">
                            Appointment
                        </p>

                        <p className="text-sm text-ink/70">
                            {
                                selectedProvider.appointment_required
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wide mb-1">
                            Earliest
                        </p>

                        <p className="text-sm text-ink/70">
                            {
                                selectedProvider.earliest_availability
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* BOOKING FORM */}

            <form
                onSubmit={handleBooking}
                className="max-w-3xl"
            >
                <div className="border border-line bg-white/30 rounded-xl p-6">
                    <p className="text-xs text-teal font-medium tracking-wide mb-5">
                        APPOINTMENT DETAILS
                    </p>

                    {/* NAME */}

                    <div className="mb-5">
                        <label
                            htmlFor="patientName"
                            className="block text-sm font-medium text-ink mb-2"
                        >
                            Under whose name?
                        </label>

                        <input
                            id="patientName"
                            type="text"
                            value={patientName}
                            onChange={(event) =>
                                setPatientName(
                                    event.target.value
                                )
                            }
                            placeholder="Full name"
                            className="w-full border border-line bg-white rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-teal transition-colors"
                        />

                        <p className="text-xs text-ink/45 mt-2">
                            Enter the patient's full name.
                        </p>
                    </div>

                    {/* PHONE */}

                    <div className="mb-5">
                        <label
                            htmlFor="patientPhone"
                            className="block text-sm font-medium text-ink mb-2"
                        >
                            Which phone number?
                        </label>

                        <input
                            id="patientPhone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={patientPhone}
                            onChange={(event) =>
                                setPatientPhone(
                                    event.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                            placeholder="10-digit phone number"
                            className="w-full border border-line bg-white rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-teal transition-colors"
                        />

                        <p className="text-xs text-ink/45 mt-2">
                            This is the contact number for
                            the appointment.
                        </p>
                    </div>

                    {/* DATE + TIME */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                        <div>
                            <label
                                htmlFor="preferredDate"
                                className="block text-sm font-medium text-ink mb-2"
                            >
                                Preferred date
                            </label>

                            <input
                                id="preferredDate"
                                type="date"
                                value={preferredDate}
                                onChange={(event) =>
                                    setPreferredDate(
                                        event.target.value
                                    )
                                }
                                min={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                                className="w-full border border-line bg-white rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-teal transition-colors"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="preferredTime"
                                className="block text-sm font-medium text-ink mb-2"
                            >
                                Preferred time
                            </label>

                            <input
                                id="preferredTime"
                                type="time"
                                value={preferredTime}
                                onChange={(event) =>
                                    setPreferredTime(
                                        event.target.value
                                    )
                                }
                                className="w-full border border-line bg-white rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-teal transition-colors"
                            />
                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-5">
                            <p className="text-sm font-medium text-red-700 mb-1">
                                Appointment not confirmed
                            </p>

                            <p className="text-xs text-red-600/80 leading-relaxed">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-teal text-white rounded-md px-5 py-3 text-sm font-medium hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting
                            ? "CALL-E is booking…"
                            : "Confirm & Book Appointment →"}
                    </button>

                    <p className="text-[11px] text-ink/40 text-center mt-3">
                        Your appointment will only be
                        confirmed if the provider confirms
                        it through CALL-E.
                    </p>
                </div>
            </form>
        </AppShell>
    );
}