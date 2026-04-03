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
// DebtorsContext.tsx
export type DebtorStatus = "Unpaid" | "Partial" | "Settled";
export type PaymentRecord = {
  id: string;
  amount: number;
  paidAt: string;
};

export type Debtor = {
  id: string;
  name: string;
  amount: number;
  principalAmount: number;
  interestAdded: number;
  credibility?: Credibility;
  status: DebtorStatus;
  dueDate?: string; // optional if not always set
  createdAt: string;
  paidAmount: number;
  settledAt?: string;
  paymentHistory: PaymentRecord[];
};

type DebtorsContextType = {
  debtors: Debtor[];
  hydrated: boolean;
  interestRate: number;
  setInterestRate: (rate: number) => void;
  addDebtor: (
    name: string,
    amount: number,
    dueDate?: number,
  ) => { ok: boolean; reason?: "duplicate_name" };
  removeDebtor: (id: string) => void;
  addMoreDebt: (id: string, amount: number) => void;
  recordPayment: (id: string, amount: number, paidAt?: number) => number;
  undoLastPayment: (id: string) => boolean;
  exportBackup: () => string;
  importBackup: (raw: string) => { ok: boolean; error?: string };
};

/* ------------------ CONTEXT ------------------ */

const DebtorsContext = createContext<DebtorsContextType | null>(null);
const DEBTORS_KEY = "bb:debtors";
const INTEREST_RATE_KEY = "bb:interest-rate";
const SCHEMA_VERSION_KEY = "bb:schema-version";
const STORAGE_SCHEMA_VERSION = 2;

/* ------------------ PROVIDER ------------------ */

export function DebtorsProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [interestRate, setInterestRate] = useState(5);
  const [hydrated, setHydrated] = useState(false);
  const debtorsRef = useRef<Debtor[]>([]);

  const normalizeDebtorName = (value: string) =>
    value
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

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
            const paidAmount =
              typeof debtor.paidAmount === "number" && debtor.paidAmount > 0
                ? debtor.paidAmount
                : 0;
            const paymentHistory = Array.isArray(debtor.paymentHistory)
              ? debtor.paymentHistory
              : [];
            const amount = typeof debtor.amount === "number" ? debtor.amount : 0;
            const principalAmount =
              typeof debtor.principalAmount === "number" &&
              debtor.principalAmount >= 0
                ? debtor.principalAmount
                : amount / (1 + interestRate / 100);
            const interestAdded =
              typeof debtor.interestAdded === "number" &&
              debtor.interestAdded >= 0
                ? debtor.interestAdded
                : Math.max(amount - principalAmount, 0);
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
              principalAmount,
              interestAdded,
              credibility: debtor.credibility,
              status,
              dueDate: debtor.dueDate,
              createdAt: debtor.createdAt ?? new Date().toISOString(),
              paidAmount,
              settledAt: debtor.settledAt,
              paymentHistory,
            };
          });
          setDebtors(normalizedDebtors);
        }
        if (storedRate) {
          const parsedRate = Number(storedRate);
          if (!Number.isNaN(parsedRate)) {
            setInterestRate(parsedRate);
          }
        }
        void AsyncStorage.setItem(
          SCHEMA_VERSION_KEY,
          String(STORAGE_SCHEMA_VERSION),
        );
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
    debtorsRef.current = debtors;
  }, [debtors]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(INTEREST_RATE_KEY, String(interestRate));
  }, [interestRate, hydrated]);

  const addDebtor = (name: string, amount: number, dueDate?: number) => {
    const normalizedName = normalizeDebtorName(name);
    const exists = debtorsRef.current.some(
      (d) => normalizeDebtorName(d.name) === normalizedName,
    );
    if (exists) {
      return { ok: false as const, reason: "duplicate_name" as const };
    }

    const principalAmount = amount;
    const interestAdded = amount * (interestRate / 100);
    const totalWithInterest = principalAmount + interestAdded;
    const newDebtor: Debtor = {
      id: Date.now().toString(),
      name,
      amount: totalWithInterest,
      principalAmount,
      interestAdded,
      credibility: "low",
      status: "Unpaid",
      createdAt: new Date().toISOString(),
      paidAmount: 0,
      paymentHistory: [],
      dueDate: new Date(
        dueDate ?? Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    const nextDebtors = [newDebtor, ...debtorsRef.current];
    debtorsRef.current = nextDebtors;
    setDebtors(nextDebtors);
    return { ok: true as const };
  };

  const removeDebtor = (id: string) => {
    setDebtors((prev) => prev.filter((debtor) => debtor.id !== id));
  };

  const addMoreDebt = (id: string, amount: number) => {
    const principalIncrease = amount;
    const interestIncrease = amount * (interestRate / 100);
    const totalWithInterest = principalIncrease + interestIncrease;
    setDebtors((prev) =>
      prev.map((debtor) =>
        debtor.id === id
          ? {
              ...debtor,
              amount: debtor.amount + totalWithInterest,
              principalAmount: debtor.principalAmount + principalIncrease,
              interestAdded: debtor.interestAdded + interestIncrease,
              status: debtor.paidAmount > 0 ? "Partial" : "Unpaid",
              settledAt: undefined,
            }
          : debtor,
      ),
    );
  };

  const recordPayment = (id: string, amount: number, paidAt?: number) => {
    let appliedAmount = 0;
    setDebtors((prev) =>
      prev.map((debtor) => {
        if (debtor.id !== id) return debtor;
        if (!amount || amount <= 0) return debtor;
        const remaining = Math.max(debtor.amount - debtor.paidAmount, 0);
        if (remaining <= 0) return debtor;
        const applied = Math.min(amount, remaining);
        appliedAmount = applied;

        const nextPaid = debtor.paidAmount + applied;
        const isSettled = nextPaid >= debtor.amount;
        const nextHistory: PaymentRecord[] = [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            amount: applied,
            paidAt: new Date(paidAt ?? Date.now()).toISOString(),
          },
          ...debtor.paymentHistory,
        ];

        return {
          ...debtor,
          paidAmount: nextPaid,
          paymentHistory: nextHistory,
          status: isSettled ? "Settled" : "Partial",
          settledAt: isSettled ? new Date(paidAt ?? Date.now()).toISOString() : undefined,
        };
      }),
    );
    return appliedAmount;
  };

  const undoLastPayment = (id: string) => {
    let undone = false;
    setDebtors((prev) =>
      prev.map((debtor) => {
        if (debtor.id !== id) return debtor;
        const [lastPayment, ...rest] = debtor.paymentHistory;
        if (!lastPayment) return debtor;
        undone = true;
        const nextPaid = Math.max(debtor.paidAmount - lastPayment.amount, 0);
        const nextStatus: DebtorStatus =
          nextPaid >= debtor.amount
            ? "Settled"
            : nextPaid > 0
              ? "Partial"
              : "Unpaid";
        return {
          ...debtor,
          paidAmount: nextPaid,
          paymentHistory: rest,
          status: nextStatus,
          settledAt: nextStatus === "Settled" ? debtor.settledAt : undefined,
        };
      }),
    );
    return undone;
  };

  const exportBackup = () => {
    return JSON.stringify(
      {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        interestRate,
        debtors,
      },
      null,
      2,
    );
  };

  const importBackup = (raw: string) => {
    try {
      const parsed = JSON.parse(raw) as {
        interestRate?: unknown;
        debtors?: unknown;
      };
      if (!Array.isArray(parsed.debtors)) {
        return { ok: false as const, error: "Invalid backup format." };
      }
      const restoredDebtors = (parsed.debtors as Partial<Debtor>[]).map(
        (debtor) => {
          const amount = typeof debtor.amount === "number" ? debtor.amount : 0;
          const paidAmount =
            typeof debtor.paidAmount === "number" && debtor.paidAmount > 0
              ? debtor.paidAmount
              : 0;
          const principalAmount =
            typeof debtor.principalAmount === "number" &&
            debtor.principalAmount >= 0
              ? debtor.principalAmount
              : amount / (1 + interestRate / 100);
          const interestAdded =
            typeof debtor.interestAdded === "number" &&
            debtor.interestAdded >= 0
              ? debtor.interestAdded
              : Math.max(amount - principalAmount, 0);
          const status: DebtorStatus =
            paidAmount >= amount
              ? "Settled"
              : paidAmount > 0
                ? "Partial"
                : "Unpaid";
          return {
            id: String(debtor.id ?? Date.now() + Math.random()),
            name: String(debtor.name ?? "Unknown"),
            amount,
            principalAmount,
            interestAdded,
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
        },
      );
      setDebtors(restoredDebtors);
      if (typeof parsed.interestRate === "number" && !Number.isNaN(parsed.interestRate)) {
        setInterestRate(parsed.interestRate);
      }
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Backup text is not valid JSON." };
    }
  };

  return (
    <DebtorsContext.Provider
      value={{
        debtors,
        hydrated,
        addDebtor,
        removeDebtor,
        addMoreDebt,
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

/* ------------------ HOOK ------------------ */

export function useDebtors() {
  const context = useContext(DebtorsContext);
  if (!context) {
    throw new Error("useDebtors must be used inside DebtorsProvider");
  }
  return context;
}
