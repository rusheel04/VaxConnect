"use client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useFlow } from "@/context/flow-context";

const VACCINES = ["BCG", "OPV", "DPT", "Hepatitis B", "Measles", "Rotavirus"];

export default function ChildSelect() {
  const { child, setChild } = useFlow();
  const router = useRouter();

  const toggle = (v: string) => {
    const has = child.vaccines.includes(v);
    setChild({ vaccines: has ? child.vaccines.filter((x) => x !== v) : [...child.vaccines, v] });
  };

  return (
    <AppShell>
      <p className="text-xs text-ink/40 mb-2">Child Vaccine · Step 3 of 3</p>
      <h1 className="font-display text-2xl text-ink mb-6">Which vaccine would you like to check?</h1>
      <div className="border border-line bg-white/40 rounded-md divide-y divide-line mb-6 max-w-md">
        {VACCINES.map((v) => (
          <label key={v} className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer">
            <input type="checkbox" checked={child.vaccines.includes(v)} onChange={() => toggle(v)} className="accent-teal w-4 h-4" />
            {v}
          </label>
        ))}
      </div>
      <button
        disabled={child.vaccines.length === 0}
        onClick={() => router.push("/availability?context=child")}
        className="bg-teal text-paper rounded-md px-5 py-2.5 text-sm font-medium hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Check Availability →
      </button>
    </AppShell>
  );
}