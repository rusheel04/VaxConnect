"use client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useFlow } from "@/context/flow-context";

const VACCINES = ["Hepatitis A", "Typhoid", "Japanese Encephalitis", "Yellow Fever", "Rabies"];

export default function TravelSelect() {
  const { travel, setTravel } = useFlow();
  const router = useRouter();

  const toggle = (v: string) => {
    const has = travel.vaccines.includes(v);
    setTravel({ vaccines: has ? travel.vaccines.filter((x) => x !== v) : [...travel.vaccines, v] });
  };

  const selectAll = () => setTravel({ vaccines: VACCINES });

  return (
    <AppShell>
      <p className="text-xs text-ink/40 mb-2">Travel Vaccine · Step 3 of 3</p>
      <h1 className="font-display text-2xl text-ink mb-6">Which vaccines do you want to check?</h1>

      <div className="border border-line bg-white/40 rounded-md divide-y divide-line mb-2 max-w-md">
        {VACCINES.map((v) => (
          <label key={v} className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer">
            <input type="checkbox" checked={travel.vaccines.includes(v)} onChange={() => toggle(v)} className="accent-teal w-4 h-4" />
            {v}
          </label>
        ))}
      </div>
      <button onClick={selectAll} className="text-xs text-teal font-medium mb-6">
        Select all recommended vaccines
      </button>
      <br />
      <button
        disabled={travel.vaccines.length === 0}
        onClick={() => router.push("/availability?context=travel")}
        className="bg-teal text-paper rounded-md px-5 py-2.5 text-sm font-medium hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Check Availability →
      </button>
    </AppShell>
  );
}