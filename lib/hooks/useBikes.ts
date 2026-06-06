'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bike } from '@/lib/types';
import { getBikesClient, createBikeClient, updateBikeClient, deleteBikeClient } from '@/lib/api/client';

export function useBikes() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBikes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBikesClient();
      setBikes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bikes'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  const createBike = async (bike: Omit<Bike, 'id' | 'created_at'>) => {
    const newBike = await createBikeClient(bike);
    setBikes(prev => [newBike, ...prev]);
    return newBike;
  };

  const updateBike = async (id: string, bike: Partial<Bike>) => {
    const updatedBike = await updateBikeClient(id, bike);
    setBikes(prev => prev.map(b => b.id === id ? updatedBike : b));
    return updatedBike;
  };

  const deleteBike = async (id: string) => {
    await deleteBikeClient(id);
    setBikes(prev => prev.filter(b => b.id !== id));
  };

  return {
    bikes,
    isLoading,
    error,
    refetch: fetchBikes,
    createBike,
    updateBike,
    deleteBike,
  };
}
