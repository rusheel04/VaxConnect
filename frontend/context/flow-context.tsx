"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type ChildFlow = { dob: string; vaccines: string[] };
type TravelFlow = { country: string; vaccines: string[] };

type FlowState = {
  child: ChildFlow;
  travel: TravelFlow;
  setChild: (c: Partial<ChildFlow>) => void;
  setTravel: (t: Partial<TravelFlow>) => void;
};

const FlowContext = createContext<FlowState | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [child, setChildState] = useState<ChildFlow>({ dob: "", vaccines: [] });
  const [travel, setTravelState] = useState<TravelFlow>({ country: "", vaccines: [] });

  const setChild = (c: Partial<ChildFlow>) => setChildState((prev) => ({ ...prev, ...c }));
  const setTravel = (t: Partial<TravelFlow>) => setTravelState((prev) => ({ ...prev, ...t }));

  return (
    <FlowContext.Provider value={{ child, travel, setChild, setTravel }}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
}