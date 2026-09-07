import { NextResponse } from "next/server";

// Dummy hospital data — replace with a call into your Python CALL-E backend later
const HOSPITALS = ["City General Hospital", "Sunrise Children's Clinic", "St. Mary's Medical Centre"];

export async function POST(req: Request) {
  const { vaccines } = (await req.json()) as { vaccines: string[] };

  await new Promise((r) => setTimeout(r, 800)); // simulate call latency

  const results = vaccines.map((vaccine) => ({
    vaccine,
    hospitals: HOSPITALS.map((hospital) => ({
      hospital,
      available: Math.random() > 0.35,
    })),
  }));

  return NextResponse.json({ results });
}