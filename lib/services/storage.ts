import { Bike, Bill } from '@/lib/types';

export function getBikesFromLocalStorage(): Bike[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('chakra_bikes');
  return stored ? JSON.parse(stored) : [];
}

export function saveBikesToLocalStorage(bikes: Bike[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('chakra_bikes', JSON.stringify(bikes));
}

export function getBillsFromLocalStorage(): Bill[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('chakra_bills');
  return stored ? JSON.parse(stored) : [];
}

export function saveBillsToLocalStorage(bills: Bill[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('chakra_bills', JSON.stringify(bills));
}