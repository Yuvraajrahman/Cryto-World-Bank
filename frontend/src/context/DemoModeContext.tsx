import { createContext, useContext, useState, ReactNode } from "react";

export type DemoRole = "bank" | "user" | null;

type DemoModeContextType = {
  demoRole: DemoRole;
  setDemoRole: (role: DemoRole) => void;
};

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoRole, setDemoRole] = useState<DemoRole>(null);
  return (
    <DemoModeContext.Provider value={{ demoRole, setDemoRole }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}
