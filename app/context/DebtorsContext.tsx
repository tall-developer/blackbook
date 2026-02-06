import { createContext, ReactNode, useContext, useState } from "react";

/* ------------------ TYPES ------------------ */

export type Credibility = "low" | "medium" | "high";
// DebtorsContext.tsx
export type DebtorStatus = "Unpaid" | "Partial" | "Settled";

export type Debtor = {
  id: string;
  name: string;
  amount: number;
  status: DebtorStatus;
  dueDate?: string; // optional if not always set
  createdAt: string;
};

type DebtorsContextType = {
  debtors: Debtor[];
  addDebtor: (name: string, amount: number, dueDate?: number) => void;
};

/* ------------------ CONTEXT ------------------ */

const DebtorsContext = createContext<DebtorsContextType | null>(null);

/* ------------------ PROVIDER ------------------ */

export function DebtorsProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>([]);

  const addDebtor = (name: string, amount: number, dueDate?: number) => {
    setDebtors((prev) => [
      {
        id: Date.now().toString(),
        name,
        amount,
        credibility: "low",
        status: "Unpaid",
        createdAt: new Date().toISOString(),
        dueDate: new Date(
          dueDate ?? Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <DebtorsContext.Provider value={{ debtors, addDebtor }}>
      {children}
    </DebtorsContext.Provider>
  );
}

/* ------------------ HOOK ------------------ */

export function useDebtors() {
  const context = useContext(DebtorsContext);
  if (!context) {
    throw new Error("useDebtors must be used inside DebtorsProvider");
  }
  return context;
}
