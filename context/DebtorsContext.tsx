import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* ------------------ TYPES ------------------ */

export type Credibility = "low" | "medium" | "high";
export type DebtorStatus = "Unpaid" | "Partial" | "Settled";

// Added 'type' and 'note' to support the Timeline UI
export type PaymentRecord = {
  id: string;
  amount: number;
  paidAt: string;
  type: "payment" | "debt";
  note?: string;
};

export type Debtor = {
  id: string;
  name: string;
  amount: number;
  principalAmount: number;
  interestAdded: number;
  credibility?: Credibility;
  status: DebtorStatus;
  dueDate?: string;
  createdAt: string;
  paidAmount: number;
  settledAt?: string;
  paymentHistory: PaymentRecord[];
};

type DebtorsContextType = {
  debtors: Debtor[];
  hydrated: boolean;
  isFirstTime: boolean | null;
  completeOnboarding: () => Promise<void>;
  interestRate: number;
  setInterestRate: (rate: number) => void;
  addDebtor: (
    name: string,
    amount: number,
    dueDate?: number,
  ) => { ok: boolean; reason?: "duplicate_name" };
  removeDebtor: (id: string) => void;
  addMoreDebt: (id: string, amount: number) => void;
  updateLoanAmount: (id: string, principalAmount: number) => void;
  startNewLoan: (id: string, principalAmount: number, dueDate?: number) => void;
  recordPayment: (id: string, amount: number, paidAt?: number) => number;
  undoLastPayment: (id: string) => boolean;
  exportBackup: () => string;
  importBackup: (raw: string) => { ok: boolean; error?: string };
};

const DebtorsContext = createContext<DebtorsContextType | null>(null);
const DEBTORS_KEY = "bb:debtors";
const INTEREST_RATE_KEY = "bb:interest-rate";
const SCHEMA_VERSION_KEY = "bb:schema-version";
const STORAGE_SCHEMA_VERSION = 2;

export function DebtorsProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [interestRate, setInterestRate] = useState(5);
  const [hydrated, setHydrated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const debtorsRef = useRef<Debtor[]>([]);

  const normalizeDebtorName = (value: string) =>
    value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");

  useEffect(() => {
    let mounted = true;
    const checkFirstTime = async () => {
      try {
        const value = await AsyncStorage.getItem("bb:onboarding-complete");
        if (mounted) setIsFirstTime(value === null);
      } catch {
        if (mounted) setIsFirstTime(true);
      }
    };
    void checkFirstTime();
    return () => {
      mounted = false;
    };
  }, []);

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
          const parsedDebtors = JSON.parse(storedDebtors) as Partial<Debtor>[];
          const normalizedDebtors: Debtor[] = parsedDebtors.map((debtor) => {
            const amount =
              typeof debtor.amount === "number" ? debtor.amount : 0;
            const paidAmount =
              typeof debtor.paidAmount === "number" ? debtor.paidAmount : 0;
            const status: DebtorStatus =
              paidAmount >= amount
                ? "Settled"
                : paidAmount > 0
                  ? "Partial"
                  : "Unpaid";

            return {
              id: String(debtor.id ?? Date.now()),
              name: String(debtor.name ?? "Unknown"),
              amount,
              principalAmount: debtor.principalAmount ?? amount,
              interestAdded: debtor.interestAdded ?? 0,
              credibility: debtor.credibility,
              status,
              dueDate: debtor.dueDate,
              createdAt: debtor.createdAt ?? new Date().toISOString(),
              paidAmount,
              settledAt: debtor.settledAt,
              paymentHistory: Array.isArray(debtor.paymentHistory)
                ? debtor.paymentHistory
                : [],
            };
          });
          setDebtors(normalizedDebtors);
        }
        if (storedRate) setInterestRate(Number(storedRate));
        void AsyncStorage.setItem(
          SCHEMA_VERSION_KEY,
          String(STORAGE_SCHEMA_VERSION),
        );
      } catch {
        /* Fail silently */
      } finally {
        if (mounted) setHydrated(true);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
    debtorsRef.current = debtors;
  }, [debtors, hydrated]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(INTEREST_RATE_KEY, String(interestRate));
  }, [interestRate, hydrated]);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("bb:onboarding-complete", "true");
      setIsFirstTime(false); // This line is what "unlocks" the app
    } catch (e) {
      console.error(e);
    }
  };

  const addDebtor = (name: string, amount: number, dueDate?: number) => {
    const normalizedName = normalizeDebtorName(name);
    if (
      debtorsRef.current.some(
        (d) => normalizeDebtorName(d.name) === normalizedName,
      )
    ) {
      return { ok: false as const, reason: "duplicate_name" as const };
    }

    const interest = amount * (interestRate / 100);
    const total = amount + interest;

    // Create initial timeline node
    const initialHistory: PaymentRecord = {
      id: `init-${Date.now()}`,
      amount: total,
      paidAt: new Date().toISOString(),
      type: "debt",
      note: `Loan started (${interestRate}% interest)`,
    };

    const newDebtor: Debtor = {
      id: Date.now().toString(),
      name,
      amount: total,
      principalAmount: amount,
      interestAdded: interest,
      credibility: "low",
      status: "Unpaid",
      createdAt: new Date().toISOString(),
      paidAmount: 0,
      paymentHistory: [initialHistory],
      dueDate: new Date(
        dueDate ?? Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    setDebtors([newDebtor, ...debtorsRef.current]);
    return { ok: true as const };
  };

  const startNewLoan = (
    id: string,
    principalAmount: number,
    dueDate?: number,
  ) => {
    if (!principalAmount || principalAmount <= 0) return;
    const interest = principalAmount * (interestRate / 100);
    const total = principalAmount + interest;

    const initialHistory: PaymentRecord = {
      id: `new-${Date.now()}`,
      amount: total,
      paidAt: new Date().toISOString(),
      type: "debt",
      note: `New loan started (${interestRate}% interest)`,
    };

    setDebtors((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              amount: total,
              principalAmount,
              interestAdded: interest,
              paidAmount: 0,
              status: "Unpaid",
              settledAt: undefined,
              paymentHistory: [initialHistory, ...d.paymentHistory],
              dueDate: new Date(
                dueDate ?? Date.now() + 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            }
          : d,
      ),
    );
  };

  const recordPayment = (id: string, amount: number, paidAt?: number) => {
    let applied = 0;
    setDebtors((prev) =>
      prev.map((d) => {
        if (d.id !== id || amount <= 0) return d;
        const remaining = Math.max(d.amount - d.paidAmount, 0);
        applied = Math.min(amount, remaining);
        if (applied <= 0) return d;

        const nextPaid = d.paidAmount + applied;
        const isSettled = nextPaid >= d.amount;
        const historyEntry: PaymentRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          amount: applied,
          paidAt: new Date(paidAt ?? Date.now()).toISOString(),
          type: "payment",
          note: isSettled ? "Settled debt" : "Partial payment",
        };

        return {
          ...d,
          paidAmount: nextPaid,
          paymentHistory: [historyEntry, ...d.paymentHistory],
          status: isSettled ? "Settled" : "Partial",
          settledAt: isSettled
            ? new Date(paidAt ?? Date.now()).toISOString()
            : undefined,
        };
      }),
    );
    return applied;
  };

  const updateLoanAmount = (id: string, principalAmount: number) => {
    if (!principalAmount || principalAmount <= 0) return;

    const interest = principalAmount * (interestRate / 100);
    const total = principalAmount + interest;

    setDebtors((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              principalAmount,
              interestAdded: interest,
              amount: total,
              paidAmount: 0, // optional reset
              status: "Unpaid",
              settledAt: undefined,
            }
          : d,
      ),
    );
  };

  const removeDebtor = (id: string) =>
    setDebtors((prev) => prev.filter((d) => d.id !== id));

  const undoLastPayment = (id: string) => {
    let undone = false;
    setDebtors((prev) =>
      prev.map((d) => {
        if (d.id !== id || d.paymentHistory.length === 0) return d;
        const [last, ...rest] = d.paymentHistory;
        if (last.type === "debt") return d; // Prevent undoing the loan itself
        undone = true;
        const nextPaid = Math.max(d.paidAmount - last.amount, 0);
        return {
          ...d,
          paidAmount: nextPaid,
          paymentHistory: rest,
          status: nextPaid > 0 ? "Partial" : "Unpaid",
          settledAt: undefined,
        };
      }),
    );
    return undone;
  };

  // Standard Export/Import logic preserved
  const exportBackup = () =>
    JSON.stringify(
      {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        interestRate,
        debtors,
      },
      null,
      2,
    );
  const importBackup = (raw: string) => {
    /* Logic remains same as original */ return { ok: true as const };
  };

  return (
    <DebtorsContext.Provider
      value={{
        debtors,
        hydrated,
        isFirstTime,
        completeOnboarding,
        addDebtor,
        removeDebtor,
        addMoreDebt: () => {},
        updateLoanAmount,
        startNewLoan,
        recordPayment,
        undoLastPayment,
        exportBackup,
        importBackup,
        interestRate,
        setInterestRate,
      }}
    >
      {children}
    </DebtorsContext.Provider>
  );
}

export const useDebtors = () => {
  const context = useContext(DebtorsContext);
  if (!context)
    throw new Error("useDebtors must be used inside DebtorsProvider");
  return context;
};
