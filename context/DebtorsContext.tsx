import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

/* ------------------ TYPES ------------------ */

export type Credibility = "low" | "medium" | "high";
// DebtorsContext.tsx
export type DebtorStatus = "Unpaid" | "Partial" | "Settled";

export type Debtor = {
  id: string;
  name: string;
  amount: number;
  credibility?: Credibility;
  status: DebtorStatus;
  dueDate?: string; // optional if not always set
  createdAt: string;
};

type DebtorsContextType = {
  debtors: Debtor[];
  interestRate: number;
  setInterestRate: (rate: number) => void;
  addDebtor: (name: string, amount: number, dueDate?: number) => void;
};

/* ------------------ CONTEXT ------------------ */

const DebtorsContext = createContext<DebtorsContextType | null>(null);
const DEBTORS_KEY = "bb:debtors";
const INTEREST_RATE_KEY = "bb:interest-rate";

/* ------------------ PROVIDER ------------------ */

export function DebtorsProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [interestRate, setInterestRate] = useState(5);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [storedDebtors, storedRate] = await Promise.all([
          AsyncStorage.getItem(DEBTORS_KEY),
          AsyncStorage.getItem(INTEREST_RATE_KEY),
        ]);
        if (!mounted) return;
        if (storedDebtors) {
          setDebtors(JSON.parse(storedDebtors) as Debtor[]);
        }
        if (storedRate) {
          const parsedRate = Number(storedRate);
          if (!Number.isNaN(parsedRate)) {
            setInterestRate(parsedRate);
          }
        }
      } catch {
        // Keep app usable even if persistence fails.
      } finally {
        if (mounted) setHydrated(true);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
  }, [debtors, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(INTEREST_RATE_KEY, String(interestRate));
  }, [interestRate, hydrated]);

  const addDebtor = (name: string, amount: number, dueDate?: number) => {
    const totalWithInterest = amount * (1 + interestRate / 100);
    setDebtors((prev) => [
      {
        id: Date.now().toString(),
        name,
        amount: totalWithInterest,
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
    <DebtorsContext.Provider value={{ debtors, addDebtor, interestRate, setInterestRate }}>
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
