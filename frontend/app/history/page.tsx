import AppShell from "@/components/app-shell";

const HISTORY = [
  { type: "Child Vaccination", date: "07 Sept 2026", detail: "2 hospitals contacted", status: "Completed" },
  { type: "Travel Vaccine · Thailand", date: "05 Sept 2026", detail: "3 hospitals contacted", status: "Completed" },
];

export default function History() {
  return (
    <AppShell>
      <h1 className="font-display text-2xl text-ink mb-6">Call History</h1>
      <div className="flex flex-col gap-3 max-w-lg">
        {HISTORY.map((h, i) => (
          <div key={i} className="border border-line bg-white/40 rounded-md p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-sm">📞 {h.type}</p>
              <span className="stamp text-teal text-xs">{h.status}</span>
            </div>
            <p className="text-xs text-ink/50">{h.date} · {h.detail}</p>
            <button className="text-xs text-teal font-medium mt-2">View Details</button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}