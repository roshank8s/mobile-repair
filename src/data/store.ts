import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState, useSyncExternalStore} from 'react';
import type {
  AppState,
  Customer,
  Expense,
  Invoice,
  Job,
  JobStatus,
  Part,
  Payment,
  Shop,
} from './types';
export type {AppState};
import {
  newId,
  nextInvoiceNo,
  nextTicketNo,
  peekInvoiceCounter,
  peekTicketCounter,
  setInvoiceCounter,
  setTicketCounter,
} from '../lib/id';
import {seedData} from './seed';

// Tiny pub-sub store with AsyncStorage persistence.
// Avoids extra deps; integrates with React via useSyncExternalStore.

const STORAGE_KEY = '@repair_shop/state_v1';

const defaultShop: Shop = {
  name: '',
  ownerName: '',
  phone: '',
  gstRatePct: 18,
  onboarded: false,
};

const initialState: AppState = {
  shop: defaultShop,
  technicians: [],
  customers: [],
  jobs: [],
  parts: [],
  payments: [],
  invoices: [],
  expenses: [],
  ticketCounter: 1000,
  invoiceCounter: 100,
};

let state: AppState = initialState;
const listeners = new Set<() => void>();
let hydrated = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

const notify = () => {
  listeners.forEach(fn => fn());
};

const schedulePersist = () => {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, 120);
};

export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const getState = () => state;
export const isHydrated = () => hydrated;

const setState = (updater: (s: AppState) => AppState) => {
  state = updater(state);
  notify();
  schedulePersist();
};

export const hydrate = async (): Promise<void> => {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      state = migrate({...initialState, ...parsed});
    } else {
      // First launch: pre-seed inventory + sample customers so the UI is alive.
      const seeded = seedData();
      state = seeded;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    state = initialState;
  }
  setTicketCounter(state.ticketCounter);
  setInvoiceCounter(state.invoiceCounter);
  hydrated = true;
  notify();
};

/**
 * Backfill fields that didn't exist in earlier app versions, so users
 * upgrading from a previous build don't crash on `job.photos.length` etc.
 */
const migrate = (s: AppState): AppState => ({
  ...s,
  jobs: (s.jobs ?? []).map(j => ({
    ...j,
    photos: Array.isArray(j.photos) ? j.photos : [],
    parts: Array.isArray(j.parts) ? j.parts : [],
    statusLog: Array.isArray(j.statusLog) ? j.statusLog : [],
  })),
  customers: s.customers ?? [],
  parts: s.parts ?? [],
  technicians: s.technicians ?? [],
  payments: s.payments ?? [],
  invoices: s.invoices ?? [],
  expenses: s.expenses ?? [],
});

export const resetAll = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
  state = initialState;
  hydrated = false;
  await hydrate();
};

// React hook helpers
export function useStoreState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export function useHydrated(): boolean {
  const [v, setV] = useState(hydrated);
  useEffect(() => {
    if (hydrated) {
      setV(true);
      return;
    }
    const unsub = subscribe(() => {
      if (hydrated) setV(true);
    });
    return unsub;
  }, []);
  return v;
}

// ---------- Mutations ----------

export const updateShop = (patch: Partial<Shop>) =>
  setState(s => ({...s, shop: {...s.shop, ...patch}}));

export const completeOnboarding = (shop: Shop) =>
  setState(s => ({...s, shop: {...shop, onboarded: true}}));

export const addTechnician = (
  name: string,
  phone?: string,
  avatarUri?: string,
) =>
  setState(s => ({
    ...s,
    technicians: [
      ...s.technicians,
      {id: newId('tech'), name, phone, avatarUri, active: true},
    ],
  }));

export const updateTechnician = (
  id: string,
  patch: Partial<Omit<import('./types').Technician, 'id'>>,
) =>
  setState(s => ({
    ...s,
    technicians: s.technicians.map(t => (t.id === id ? {...t, ...patch} : t)),
  }));

export const removeTechnician = (id: string) =>
  setState(s => ({
    ...s,
    technicians: s.technicians.filter(t => t.id !== id),
    jobs: s.jobs.map(j =>
      j.technicianId === id ? {...j, technicianId: undefined} : j,
    ),
  }));

// ----- Customers -----
export const upsertCustomer = (
  input: Omit<Customer, 'id' | 'createdAt'> & {id?: string},
): Customer => {
  let result!: Customer;
  setState(s => {
    if (input.id) {
      const existing = s.customers.find(c => c.id === input.id);
      if (existing) {
        const merged: Customer = {...existing, ...input, id: existing.id};
        result = merged;
        return {
          ...s,
          customers: s.customers.map(c => (c.id === input.id ? merged : c)),
        };
      }
    }
    // Match by phone if present
    const byPhone = input.phone
      ? s.customers.find(c => c.phone === input.phone)
      : undefined;
    if (byPhone) {
      const merged: Customer = {...byPhone, ...input, id: byPhone.id};
      result = merged;
      return {
        ...s,
        customers: s.customers.map(c => (c.id === byPhone.id ? merged : c)),
      };
    }
    const fresh: Customer = {
      id: newId('cust'),
      createdAt: new Date().toISOString(),
      ...input,
    };
    result = fresh;
    return {...s, customers: [fresh, ...s.customers]};
  });
  return result;
};

export const deleteCustomer = (id: string) =>
  setState(s => ({...s, customers: s.customers.filter(c => c.id !== id)}));

// ----- Parts -----
export const upsertPart = (
  input: Omit<Part, 'id' | 'createdAt'> & {id?: string},
): Part => {
  let result!: Part;
  setState(s => {
    if (input.id) {
      const existing = s.parts.find(p => p.id === input.id);
      if (existing) {
        const merged: Part = {...existing, ...input, id: existing.id};
        result = merged;
        return {
          ...s,
          parts: s.parts.map(p => (p.id === input.id ? merged : p)),
        };
      }
    }
    const fresh: Part = {
      id: newId('part'),
      createdAt: new Date().toISOString(),
      ...input,
    };
    result = fresh;
    return {...s, parts: [fresh, ...s.parts]};
  });
  return result;
};

export const deletePart = (id: string) =>
  setState(s => ({...s, parts: s.parts.filter(p => p.id !== id)}));

export const adjustStock = (id: string, delta: number) =>
  setState(s => ({
    ...s,
    parts: s.parts.map(p =>
      p.id === id ? {...p, stock: Math.max(0, p.stock + delta)} : p,
    ),
  }));

// ----- Jobs -----
export type CreateJobInput = {
  customerId: string;
  device: Job['device'];
  issue: string;
  estimateAmount: number;
  promisedAt?: string;
  technicianId?: string;
  photos?: string[];
  warrantyDays?: number;
};

export const createJob = (input: CreateJobInput): Job => {
  const now = new Date().toISOString();
  let job!: Job;
  setState(s => {
    const ticketCounter = s.ticketCounter + 1;
    setTicketCounter(ticketCounter);
    job = {
      id: newId('job'),
      ticketNo: `RS-${ticketCounter}`,
      customerId: input.customerId,
      device: input.device,
      issue: input.issue,
      technicianId: input.technicianId,
      status: 'received',
      estimateAmount: input.estimateAmount,
      promisedAt: input.promisedAt,
      receivedAt: now,
      parts: [],
      statusLog: [{status: 'received', at: now}],
      photos: input.photos ?? [],
      warrantyDays: input.warrantyDays,
      createdAt: now,
      updatedAt: now,
    };
    return {...s, jobs: [job, ...s.jobs], ticketCounter};
  });
  // Avoid lint warning about unused next-ticket helper
  void nextTicketNo;
  return job;
};

export const addJobPhoto = (jobId: string, dataUri: string) =>
  setState(s => ({
    ...s,
    jobs: s.jobs.map(j =>
      j.id === jobId
        ? {...j, photos: [...(j.photos ?? []), dataUri], updatedAt: new Date().toISOString()}
        : j,
    ),
  }));

export const removeJobPhoto = (jobId: string, index: number) =>
  setState(s => ({
    ...s,
    jobs: s.jobs.map(j => {
      if (j.id !== jobId) return j;
      const photos = (j.photos ?? []).filter((_, i) => i !== index);
      return {...j, photos, updatedAt: new Date().toISOString()};
    }),
  }));

export const updateJob = (id: string, patch: Partial<Job>) =>
  setState(s => ({
    ...s,
    jobs: s.jobs.map(j =>
      j.id === id ? {...j, ...patch, updatedAt: new Date().toISOString()} : j,
    ),
  }));

export const transitionJob = (id: string, next: JobStatus, note?: string) =>
  setState(s => ({
    ...s,
    jobs: s.jobs.map(j => {
      if (j.id !== id) return j;
      const at = new Date().toISOString();
      const patch: Partial<Job> = {
        status: next,
        statusLog: [...j.statusLog, {status: next, at, note}],
        updatedAt: at,
      };
      if (next === 'delivered') patch.deliveredAt = at;
      return {...j, ...patch};
    }),
  }));

export const addPartToJob = (jobId: string, partId: string, qty: number) =>
  setState(s => {
    const part = s.parts.find(p => p.id === partId);
    if (!part) return s;
    const newQty = Math.max(1, qty);
    const stockTaken = Math.min(part.stock, newQty);
    return {
      ...s,
      parts: s.parts.map(p =>
        p.id === partId ? {...p, stock: Math.max(0, p.stock - stockTaken)} : p,
      ),
      jobs: s.jobs.map(j => {
        if (j.id !== jobId) return j;
        const existing = j.parts.find(jp => jp.partId === partId);
        const updatedParts = existing
          ? j.parts.map(jp =>
              jp.partId === partId ? {...jp, qty: jp.qty + newQty} : jp,
            )
          : [
              ...j.parts,
              {
                partId,
                name: part.name,
                qty: newQty,
                unitPrice: part.sellPrice,
              },
            ];
        return {
          ...j,
          parts: updatedParts,
          updatedAt: new Date().toISOString(),
        };
      }),
    };
  });

export const removePartFromJob = (jobId: string, partId: string) =>
  setState(s => {
    const job = s.jobs.find(j => j.id === jobId);
    const jobPart = job?.parts.find(jp => jp.partId === partId);
    return {
      ...s,
      parts: jobPart
        ? s.parts.map(p =>
            p.id === partId ? {...p, stock: p.stock + jobPart.qty} : p,
          )
        : s.parts,
      jobs: s.jobs.map(j =>
        j.id === jobId
          ? {
              ...j,
              parts: j.parts.filter(jp => jp.partId !== partId),
              updatedAt: new Date().toISOString(),
            }
          : j,
      ),
    };
  });

export const setJobFinalAmount = (id: string, amount: number) =>
  updateJob(id, {finalAmount: amount});

export const deleteJob = (id: string) =>
  setState(s => ({...s, jobs: s.jobs.filter(j => j.id !== id)}));

// ----- Payments -----
export const recordPayment = (
  jobId: string,
  amount: number,
  mode: Payment['mode'],
  ref?: string,
): Payment => {
  let p!: Payment;
  setState(s => {
    p = {
      id: newId('pay'),
      jobId,
      amount,
      mode,
      ref,
      at: new Date().toISOString(),
    };
    return {...s, payments: [p, ...s.payments]};
  });
  return p;
};

// ----- Invoices -----
export const createInvoice = (
  jobId: string,
  split: {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
    ratePct: number;
  },
): Invoice => {
  let inv!: Invoice;
  setState(s => {
    const job = s.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    const invoiceCounter = s.invoiceCounter + 1;
    setInvoiceCounter(invoiceCounter);
    const yr = new Date().getFullYear().toString().slice(-2);
    inv = {
      id: newId('inv'),
      invoiceNo: `INV-${yr}-${invoiceCounter}`,
      jobId,
      customerId: job.customerId,
      ...split,
      createdAt: new Date().toISOString(),
    };
    return {...s, invoices: [inv, ...s.invoices], invoiceCounter};
  });
  void nextInvoiceNo;
  void peekTicketCounter;
  void peekInvoiceCounter;
  return inv;
};

// ----- Expenses -----
export const addExpense = (
  input: Omit<Expense, 'id' | 'at'> & {at?: string},
): Expense => {
  let exp!: Expense;
  setState(s => {
    exp = {
      id: newId('exp'),
      at: input.at ?? new Date().toISOString(),
      label: input.label,
      amount: input.amount,
      category: input.category,
      mode: input.mode,
      note: input.note,
    };
    return {...s, expenses: [exp, ...s.expenses]};
  });
  return exp;
};

export const deleteExpense = (id: string) =>
  setState(s => ({...s, expenses: s.expenses.filter(e => e.id !== id)}));

// ----- Selectors -----
export const selectCustomerById = (id?: string) =>
  id ? state.customers.find(c => c.id === id) : undefined;
export const selectJobsForCustomer = (customerId: string) =>
  state.jobs.filter(j => j.customerId === customerId);
export const selectInvoiceForJob = (jobId: string) =>
  state.invoices.find(i => i.jobId === jobId);
