import { useState } from 'react';
import {
  startReconciliation,
  reconcileTransaction,
  bulkReconcile,
  undoReconciliation,
  type StartReconciliationRequest,
  type StartReconciliationResponse,
  type ReconcileRequest,
  type ReconcileResponse,
  type BulkReconcileRequest,
  type BulkReconcileResponse,
} from '../services';

export const useBankReconciliation = () => {
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (
    data?: StartReconciliationRequest
  ): Promise<StartReconciliationResponse | undefined> => {
    setReconciling(true);
    setError(null);
    try {
      const response = await startReconciliation(data);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setReconciling(false);
    }
  };

  const reconcile = async (
    data: ReconcileRequest
  ): Promise<ReconcileResponse | undefined> => {
    setReconciling(true);
    setError(null);
    try {
      const response = await reconcileTransaction(data);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setReconciling(false);
    }
  };

  const reconcileBulk = async (
    data: BulkReconcileRequest
  ): Promise<BulkReconcileResponse | undefined> => {
    setReconciling(true);
    setError(null);
    try {
      const response = await bulkReconcile(data);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setReconciling(false);
    }
  };

  const undo = async (
    transactionId: string
  ): Promise<ReconcileResponse | undefined> => {
    setReconciling(true);
    setError(null);
    try {
      const response = await undoReconciliation(transactionId);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setReconciling(false);
    }
  };

  return {
    start,
    reconcile,
    reconcileBulk,
    undo,
    reconciling,
    error,
  };
};
