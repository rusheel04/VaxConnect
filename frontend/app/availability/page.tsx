"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useFlow } from "@/context/flow-context";

type Provider = {
    hospital: string;
    provider_id: string;
    available: boolean;
    price: string;
    appointment_required: string;
    earliest_availability: string;
    source: "CALL-E VERIFIED";
};

export default function AvailabilityPage() {
    const router = useRouter();

    const {
        selectedVaccine,
        generalPinCode,
        travel,
        child,
        setSelectedProvider,
    } = useFlow();

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [providers, setProviders] =
        useState<Provider[]>([]);

    const [hasSearched, setHasSearched] =
        useState(false);

    const pinCode =
        generalPinCode ||
        travel?.pinCode ||
        child?.pinCode ||
        "";

    const handleCallProviders =
        async () => {
            setError("");
            setProviders([]);
            setHasSearched(false);

            if (!selectedVaccine) {
                setError(
                    "Please select a vaccine first."
                );
                return;
            }

            if (!/^\d{6}$/.test(pinCode)) {
                setError(
                    "Please enter a valid 6-digit PIN code."
                );
                return;
            }

            setLoading(true);

            try {
                console.log(
                    "Calling VaxConnect availability API..."
                );

                console.log(
                    "Vaccine:",
                    selectedVaccine
                );

                console.log(
                    "PIN:",
                    pinCode
                );

                /*
                 * IMPORTANT:
                 *
                 * Do NOT access CALLE_API_KEY,
                 * CALLE_TEST_PHONE or any other
                 * secret environment variable here.
                 *
                 * This page runs in the browser.
                 *
                 * The API route on the server handles
                 * the actual CALL-E call.
                 */
                const response =
                    await fetch(
                        "/api/availability",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                vaccine:
                                    selectedVaccine,

                                pinCode,
                            }),
                        }
                    );

                let data: any = null;

                try {
                    data =
                        await response.json();
                } catch {
                    data = null;
                }

                console.log(
                    "Availability API response:",
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                            "Availability enquiry failed."
                    );
                }

                if (
                    !data ||
                    !Array.isArray(
                        data.providers
                    )
                ) {
                    throw new Error(
                        "CALL-E returned an invalid availability response."
                    );
                }

                const realProviders =
                    data.providers.filter(
                        (provider: any) =>
                            provider &&
                            provider.source ===
                                "CALL-E VERIFIED"
                    );

                setProviders(
                    realProviders
                );

                setHasSearched(true);

                if (
                    realProviders.length ===
                    0
                ) {
                    setError(
                        "CALL-E completed the enquiry, but no provider availability result was returned."
                    );
                }
            } catch (err) {
                console.error(
                    "Availability enquiry error:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Availability enquiry failed."
                );

                setProviders([]);
                setHasSearched(true);
            } finally {
                setLoading(false);
            }
        };

    const handleBook = (
        provider: Provider
    ) => {
        setSelectedProvider(
            provider
        );

        router.push(
            "/appointment"
        );
    };

    return (
        <AppShell>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">
                        Vaccine Availability
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Contact a vaccination
                        provider through
                        CALL-E to check
                        real-time availability.
                    </p>
                </div>

                {/* Search / vaccine information */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Selected Vaccine
                            </label>

                            <div className="rounded-lg border bg-muted/30 px-4 py-3">
                                {selectedVaccine ||
                                    "No vaccine selected"}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                PIN Code
                            </label>

                            <div className="rounded-lg border bg-muted/30 px-4 py-3">
                                {pinCode ||
                                    "No PIN code provided"}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={
                            handleCallProviders
                        }
                        disabled={
                            loading ||
                            !selectedVaccine ||
                            !/^\d{6}$/.test(
                                pinCode
                            )
                        }
                        className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Calling Provider..."
                            : "Call to Check Availability"}
                    </button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />

                            <div>
                                <p className="font-medium">
                                    CALL-E is contacting
                                    the provider
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Please wait while
                                    VaxConnect checks
                                    vaccine availability,
                                    price, appointment
                                    requirements and
                                    earliest availability.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {hasSearched &&
                    !loading &&
                    providers.length >
                        0 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Availability Results
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    This information was
                                    obtained from a real
                                    CALL-E provider enquiry.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold">
                                                    Provider
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold">
                                                    Availability
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold">
                                                    Price
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold">
                                                    Appointment
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold">
                                                    Earliest
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold">
                                                    Source
                                                </th>

                                                <th className="px-4 py-3 text-left font-semibold">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {providers.map(
                                                (
                                                    provider,
                                                    index
                                                ) => (
                                                    <tr
                                                        key={
                                                            provider.provider_id ||
                                                            index
                                                        }
                                                        className="border-b last:border-b-0"
                                                    >
                                                        <td className="px-4 py-4 font-medium">
                                                            {
                                                                provider.hospital
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <span
                                                                className={
                                                                    provider.available
                                                                        ? "font-medium text-green-600"
                                                                        : "font-medium text-red-600"
                                                                }
                                                            >
                                                                {provider.available
                                                                    ? "Available"
                                                                    : "Not available"}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            {
                                                                provider.price
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            {
                                                                provider.appointment_required
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            {
                                                                provider.earliest_availability
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold">
                                                                CALL-E VERIFIED
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleBook(
                                                                        provider
                                                                    )
                                                                }
                                                                disabled={
                                                                    !provider.available
                                                                }
                                                                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Book
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                                <strong>
                                    CALL-E VERIFIED:
                                </strong>{" "}
                                The provider information
                                displayed above comes from
                                the live CALL-E availability
                                enquiry. VaxConnect does not
                                generate or invent provider
                                availability, pricing,
                                appointment requirements or
                                dates.
                            </div>
                        </div>
                    )}

                {/* No result */}
                {hasSearched &&
                    !loading &&
                    providers.length ===
                        0 &&
                    !error && (
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="font-semibold">
                                No availability result
                                returned
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                CALL-E completed the
                                enquiry but there was no
                                provider result to display.
                            </p>
                        </div>
                    )}
            </div>
        </AppShell>
    );
}