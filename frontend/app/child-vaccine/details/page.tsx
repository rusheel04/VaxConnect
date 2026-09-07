"use client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useFlow } from "@/context/flow-context";

export default function ChildDetails() {
  const { child, setChild } = useFlow();
  const router = useRouter();

  return (
    <AppShell>
      <p className="text-xs text-ink/40 mb-2">Child Vaccine · Step 2 of 3</p>
      <h1 className="font-display text-2xl text-ink mb-6">Tell us about your child</h1>
      <div className="border border-line bg-white/40 rounded-md p-6 max-w-sm mb-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/70">Date of Birth</span>
          <input
            type="date"
            value={child.dob}
            onChange={(e) => setChild({ dob: e.target.value })}
            className="border border-line rounded-md px-3 py-2 bg-white/70 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>
      </div>
      <button
        disabled={!child.dob}
        onClick={() => router.push("/child-vaccine/select")}
        className="bg-teal text-paper rounded-md px-5 py-2.5 text-sm font-medium hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </AppShell>
  );
}