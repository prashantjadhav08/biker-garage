'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bill } from '@/lib/types';
import { getBillsClient, createBillClient, getBillByIdClient, getRemindersClient } from '@/lib/api/client';

export function useBills(days?: number) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBillsClient(days);
      setBills(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bills'));
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const createBill = async (bill: Omit<Bill, 'id' | 'created_at' | 'bill_number' | 'gst_amount' | 'total'>) => {
    const newBill = await createBillClient(bill);
    setBills(prev => [newBill, ...prev]);
    return newBill;
  };

  const getBillById = async (id: string) => {
    return getBillByIdClient(id);
  };

  const getReminders = async () => {
    return getRemindersClient();
  };

  return {
    bills,
    isLoading,
    error,
    refetch: fetchBills,
    createBill,
    getBillById,
    getReminders,
  };
}
