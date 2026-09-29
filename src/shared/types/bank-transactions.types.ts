// Transaction Bank Types
export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  reconciled: boolean;
  voucherId?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface UploadedTransaction {
  date: string;
  time: string;
  concept: string;
  amount: number;
  currency: string;
  is_deposit: boolean;
  bank_name: string;
  validation_flag: boolean;
  /** Depósito marcado como devolución del banco: entrada en el informe de gastos */
  is_bank_refund?: boolean;
  status: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTransactionsResponse {
  message: string;
  success: boolean;
  totalTransactions: number;
  validTransactions: number;
  invalidTransactions: number;
  previouslyProcessedTransactions: number;
  transactions: UploadedTransaction[];
  errors: Array<{ [key: string]: unknown }>;
  dateRange: {
    start: string;
    end: string;
  };
  lastDayTransaction: UploadedTransaction[];
}

export interface TransactionsBankQuery {
  reconciled?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface TransactionsBankResponse {
  transactions: BankTransaction[];
  total: number;
}

export interface ExpensesSummary {
  /** Solo retiros */
  totalExpenses: number;
  /** Cantidad de retiros */
  count: number;
  currencies: string[];
  largestExpense: number;
  /** Suma de devoluciones bancarias (opcionales mientras se despliega el backend) */
  totalRefunds?: number;
  refundCount?: number;
  /** totalExpenses - totalRefunds */
  netExpenses?: number;
}

export interface ExpensesByMonthResponse {
  month: string;
  expenses: UploadedTransaction[];
  summary: ExpensesSummary;
}
