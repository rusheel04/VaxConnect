import Link from "next/link";
import AppShell from "@/components/app-shell";

export default function Dashboard() {
  return (
    <AppShell>
      <h1 className="font-display text-2xl text-ink mb-8">Welcome to VaxConnect 👋</h1>
      <div className="grid grid-cols-2 gap-5">
        <Card
          href="/child-vaccine/info"
          icon="👶"
          title="Child Vaccine Check"
          body="Check vaccines based on your child's age and Indian vaccination guidelines."
          cta="Check Child Vaccines"
        />
        <Card
          href="/travel-vaccine/country"
          icon="✈️"
          title="Travel Vaccine Check"
          body="Find vaccination information for your international trip."
          cta="Check Travel Vaccines"
        />
      </div>
    </AppShell>
  );
}

function Card({ href, icon, title, body, cta }: { href: string; icon: string; title: string; body: string; cta: string }) {
  return (
    <Link href={href} className="group border border-line bg-white/40 rounded-md p-6 hover:border-teal transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h2 className="font-display text-lg text-ink mb-2">{title}</h2>
      <p className="text-sm text-ink/60 leading-relaxed mb-5">{body}</p>
      <span className="text-sm font-medium text-teal group-hover:underline">{cta} →</span>
    </Link>
  );
}