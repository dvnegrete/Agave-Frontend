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
  page?: number;
  limit?: number;
  reconciled?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface TransactionsBankResponse {
  transactions: BankTransaction[];
  total: number;
  page: number;
  limit: number;
}
