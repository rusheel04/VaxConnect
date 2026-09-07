import Link from "next/link";
import AppShell from "@/components/app-shell";

export default function ChildInfo() {
  return (
    <AppShell>
      <p className="text-xs text-ink/40 mb-2">Child Vaccine · Step 1 of 3</p>
      <h1 className="font-display text-2xl text-ink mb-4">Vaccination in India</h1>
      <div className="border border-line bg-white/40 rounded-md p-6 text-sm leading-relaxed text-ink/75 mb-6">
        India's Universal Immunization Programme covers vaccines against tuberculosis, polio,
        diphtheria, pertussis, tetanus, hepatitis B, measles and more, delivered according to
        the child's age from birth through adolescence. Timing matters — most vaccines are
        given in a fixed schedule of doses spaced weeks or months apart.
      </div>
      <Link href="/child-vaccine/details" className="inline-block bg-teal text-paper rounded-md px-5 py-2.5 text-sm font-medium hover:bg-teal-dark">
        Continue →
      </Link>
    </AppShell>
  );
}