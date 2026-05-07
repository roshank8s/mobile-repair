export type JobStatus =
  | 'received'
  | 'diagnosed'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export const JOB_STATUS_ORDER: JobStatus[] = [
  'received',
  'diagnosed',
  'quoted',
  'approved',
  'in_progress',
  'ready',
  'delivered',
];

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  received: 'Received',
  diagnosed: 'Diagnosed',
  quoted: 'Quoted',
  approved: 'Approved',
  in_progress: 'Under Repair',
  ready: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export type PaymentMode = 'cash' | 'upi' | 'card';

export type Shop = {
  name: string;
  ownerName: string;
  phone: string;
  gstin?: string;
  address?: string;
  gstRatePct: number; // default 18
  onboarded: boolean;
  /** Shop logo / brand mark, shown on the More tab and on invoices. */
  logoUri?: string;
  /** Owner's profile photo, shown on the More tab. */
  ownerAvatarUri?: string;
};

export type Technician = {
  id: string;
  name: string;
  phone?: string;
  active: boolean;
  avatarUri?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  avatarUri?: string;
  createdAt: string;
};

export type Device = {
  brand: string;
  model: string;
  imei?: string;
  color?: string;
  passwordNote?: string;
  accessories?: string;
};

export type JobPart = {
  partId: string;
  name: string;
  qty: number;
  unitPrice: number;
};

export type StatusLogEntry = {
  status: JobStatus;
  at: string;
  note?: string;
};

export type Job = {
  id: string;
  ticketNo: string;
  customerId: string;
  device: Device;
  issue: string;
  technicianId?: string;
  status: JobStatus;
  estimateAmount: number;
  finalAmount?: number;
  promisedAt?: string;
  receivedAt: string;
  deliveredAt?: string;
  parts: JobPart[];
  statusLog: StatusLogEntry[];
  /** Photos of the device condition at intake (and any during repair). */
  photos: string[];
  /** How many days warranty the shop offers on this repair. 0 = no warranty. */
  warrantyDays?: number;
  createdAt: string;
  updatedAt: string;
};

export type Part = {
  id: string;
  name: string;
  brand?: string;
  compatModels?: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  lowStockAt: number;
  imageUri?: string;
  /** Free-text supplier / vendor name. Helpful when reordering. */
  supplier?: string;
  createdAt: string;
};

export type ExpenseCategory =
  | 'rent'
  | 'staff'
  | 'parts'
  | 'utility'
  | 'travel'
  | 'other';

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  rent: 'Rent',
  staff: 'Staff',
  parts: 'Parts purchase',
  utility: 'Utilities',
  travel: 'Travel',
  other: 'Other',
};

export type Expense = {
  id: string;
  label: string;
  amount: number;
  category: ExpenseCategory;
  mode: PaymentMode;
  note?: string;
  at: string;
};

export type Payment = {
  id: string;
  jobId: string;
  amount: number;
  mode: PaymentMode;
  ref?: string;
  at: string;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  jobId: string;
  customerId: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  ratePct: number;
  createdAt: string;
};

export type AppState = {
  shop: Shop;
  technicians: Technician[];
  customers: Customer[];
  jobs: Job[];
  parts: Part[];
  payments: Payment[];
  invoices: Invoice[];
  expenses: Expense[];
  ticketCounter: number;
  invoiceCounter: number;
};
