"use client";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useFlow } from "@/context/flow-context";
import { useState } from "react";

type Result = {
  vaccine: string;
  hospitals: { hospital: string; available: boolean }[];
};

export default function Availability() {
  const params = useSearchParams();
  const isChild = params.get("context") === "child";
  const { child, travel } = useFlow();
  const vaccines = isChild ? child.vaccines : travel.vaccines;

  const [called, setCalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const handleCall = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({ vaccines }),
      });
      const data = await res.json();
      setResults(data.results);
      setCalled(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-ink mb-2">Find Vaccine Availability</h1>
      <p className="text-xs text-gold mb-6">⚠ Using dummy call results during development — no real calls are made.</p>

      <div className="border border-line bg-white/40 rounded-md p-5 mb-6 max-w-md">
        <p className="text-xs text-ink/40 mb-2">Selected vaccines</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {vaccines.map((v) => (
            <span key={v} className="text-xs border border-line rounded-full px-3 py-1">{v}</span>
          ))}
        </div>
        <p className="text-xs text-ink/40 mb-1">Location</p>
        <p className="text-sm">📍 Your location</p>
      </div>

      {!called ? (
        <button
          onClick={handleCall}
          disabled={loading || vaccines.length === 0}
          className="bg-teal text-paper rounded-md px-5 py-2.5 text-sm font-medium hover:bg-teal-dark disabled:opacity-50"
        >
          {loading ? "Calling hospitals…" : "Call Nearby Hospitals"}
        </button>
      ) : (
        <div className="flex flex-col gap-6 max-w-md">
          {results.map((r) => (
            <div key={r.vaccine}>
              <p className="font-display text-lg mb-3">💉 {r.vaccine}</p>
              <div className="flex flex-col gap-2">
                {r.hospitals.map((h) => (
                  <div key={h.hospital} className="flex items-center justify-between border-b border-line pb-2">
                    <span className="text-sm">🏥 {h.hospital}</span>
                    <span className={`stamp ${h.available ? "text-teal" : "text-red"}`}>
                      {h.available ? "Available ✓" : "Not Available ✕"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleCall} className="text-xs text-teal font-medium self-start">
            Call again
          </button>
        </div>
      )}
    </AppShell>
  );
}