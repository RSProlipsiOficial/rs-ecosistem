export enum LedgerEventType {
  COMMISSION_SHOP = 'commission_shop',
  COMMISSION_REFERRAL = 'commission_referral',
  BONUS = 'bonus',
  PURCHASE = 'purchase',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  FEES = 'fees',
  ADJUSTMENT = 'adjustment',
  CHARGEBACK = 'chargeback',
  PAYMENT_RECEIVED = 'payment_received',
}

export enum LedgerState {
  POSTED = 'posted',
  HELD = 'held',
  REVERSED = 'reversed',
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneE164?: string;
}

export interface LedgerEntry {
  seq: number;
  hash: string;
  type: LedgerEventType;
  origin: 'marketplace'|'sigma'|'admin'|'user';
  refId: string;
  description: string;
  amount: number;      // in cents
  fee: number;         // in cents
  balanceAfter: number;// in cents
  state: LedgerState;
  occurredAt: string;  // ISO string
  user?: User;
  details?: { [key: string]: string };
}

export interface BalanceDTO {
  current: number; // in cents
  pending: number; // in cents
  lastSeq: number;
}

export interface TransferPayload {
  toUserId: string;
  amount: number;
  note?: string;
  twoFACode: string;
}

export interface WithdrawalPayload {
  pixKeyId: string;
  amount: number;
  twoFACode: string;
}

export interface Consultant {
  id: string;
  name: string;
  avatarUrl: string;
  pin: string;
  status: 'active' | 'inactive';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Sale {
  // Use `seq` to conform to DataTable's key requirement
  seq: number;
  id: string;
  clientId: string;
  clientName: string;
  items: { name: string; amount: number }[];
  totalAmount: number; // in cents
  state: LedgerState;
  occurredAt: string;
}