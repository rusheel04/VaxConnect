"use client";

import { useSearchParams } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useFlow } from "@/context/flow-context";
import { useEffect, useState } from "react";

type CallData = {
  status?: string;
  summary?: string | null;
  structured_result?: Record<string, unknown> | null;
  structuredResult?: Record<string, unknown> | null;
  task_completed?: boolean | null;
  completion_confidence?: number | null;
  evidence?: unknown[];
  recipients?: {
    status?: string;
    attempts?: {
      status?: string;
      transcript_turns?: {
        role?: string;
        content?: string;
      }[];
      summary?: string;
    }[];
  }[];
};

export default function Availability() {
  const params = useSearchParams();
  const isChild = params.get("context") === "child";

  const { child, travel } = useFlow();
  const vaccines = isChild ? child.vaccines : travel.vaccines;

  const [called, setCalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);

  const handleCall = async () => {
    setLoading(true);
    setCallData(null);

    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vaccines }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "CALL-E request failed");
        return;
      }

      setCallId(data.callId);
      setCalled(true);
    } catch (error) {
      console.error("Request error:", error);
      alert("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!callId) return;

    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/availability/status?callId=${encodeURIComponent(callId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Status error:", data);
          return;
        }

        console.log("CALL-E status:", data);

        setCallData(data);

        if (
          data.status === "completed" ||
          data.status === "failed" ||
          data.status === "canceled"
        ) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    checkStatus();

    interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [callId]);

  const result =
    callData?.structured_result ??
    callData?.structuredResult ??
    null;

  const transcript =
    callData?.recipients?.[0]?.attempts?.[0]?.transcript_turns ?? [];

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-ink mb-2">
        Find Vaccine Availability
      </h1>

      <p className="text-xs text-gold mb-6">
        📞 CALL-E will contact your authorized test number.
      </p>

      <div className="border border-line bg-white/40 rounded-md p-5 mb-6 max-w-md">
        <p className="text-xs text-ink/40 mb-2">
          Selected vaccines
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {vaccines.map((v) => (
            <span
              key={v}
              className="text-xs border border-line rounded-full px-3 py-1"
            >
              {v}
            </span>
          ))}
        </div>

        <p className="text-xs text-ink/40 mb-1">
          Location
        </p>

        <p className="text-sm">
          📍 Your location
        </p>
      </div>

      {!called ? (
        <button
          onClick={handleCall}
          disabled={loading || vaccines.length === 0}
          className="bg-teal text-paper rounded-md px-5 py-2.5 text-sm font-medium hover:bg-teal-dark disabled:opacity-50"
        >
          {loading ? "Calling…" : "Call Nearby Hospitals"}
        </button>
      ) : (
        <div className="flex flex-col gap-5 max-w-md">

          <div className="border border-line rounded-md p-4 bg-white/40">
            <p className="text-xs text-ink/40 mb-1">
              CALL-E status
            </p>

            <p className="text-sm font-medium">
              {callData?.status || "queued"}
            </p>
          </div>

          {callData?.status === "completed" ? (
            <>
              <div className="border border-line rounded-md p-5 bg-white/40">
                <p className="font-display text-lg mb-3">
                  📋 Vaccine Availability Result
                </p>

                {result ? (
                  <div className="flex flex-col gap-3 text-sm">
                    {Object.entries(result).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-4 border-b border-line pb-2"
                      >
                        <span className="text-ink/50">
                          {key.replaceAll("_", " ")}
                        </span>

                        <span className="font-medium text-right">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/60">
                    {callData.summary ||
                      "The call completed, but no structured result was returned."}
                  </p>
                )}
              </div>

              {callData.summary && (
                <div className="border border-line rounded-md p-5 bg-white/40">
                  <p className="font-display text-lg mb-2">
                    📝 Call Summary
                  </p>

                  <p className="text-sm leading-6">
                    {callData.summary}
                  </p>
                </div>
              )}

              {transcript.length > 0 && (
                <div className="border border-line rounded-md p-5 bg-white/40">
                  <p className="font-display text-lg mb-3">
                    💬 Conversation
                  </p>

                  <div className="flex flex-col gap-3">
                    {transcript.map((turn, index) => (
                      <div
                        key={index}
                        className="border-b border-line pb-2"
                      >
                        <p className="text-xs text-ink/40 mb-1">
                          {turn.role || "Speaker"}
                        </p>

                        <p className="text-sm">
                          {turn.content || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : callData?.status === "failed" ? (
            <div className="border border-red rounded-md p-5">
              <p className="text-sm text-red font-medium">
                ❌ The CALL-E call failed.
              </p>

              {callData.summary && (
                <p className="text-sm mt-2">
                  {callData.summary}
                </p>
              )}
            </div>
          ) : (
            <div className="border border-line rounded-md p-5 bg-white/40">
              <p className="text-sm text-teal">
                📞 CALL-E is processing the call…
              </p>

              <p className="text-xs text-ink/50 mt-2">
                The website will automatically update when the call finishes.
              </p>
            </div>
          )}

          <button
            onClick={handleCall}
            disabled={loading}
            className="text-xs text-teal font-medium self-start"
          >
            {loading ? "Calling…" : "Call again"}
          </button>
        </div>
      )}
    </AppShell>
  );
}