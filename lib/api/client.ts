import { Bike, Bill, ServiceItem } from '@/lib/types';

const API_BASE = '';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Bikes
export async function getBikesClient(): Promise<Bike[]> {
  return api<Bike[]>('/api/bikes');
}

export async function createBikeClient(bike: Omit<Bike, 'id' | 'created_at'>): Promise<Bike> {
  return api<Bike>('/api/bikes', {
    method: 'POST',
    body: JSON.stringify(bike),
  });
}

export async function updateBikeClient(id: string, bike: Partial<Bike>): Promise<Bike> {
  return api<Bike>('/api/bikes', {
    method: 'PUT',
    body: JSON.stringify({ id, ...bike }),
  });
}

export async function deleteBikeClient(id: string): Promise<void> {
  await api<{success: boolean}>(`/api/bikes?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// Bills
export async function getBillsClient(days?: number): Promise<Bill[]> {
  const qs = days ? `?days=${days}` : '';
  return api<Bill[]>(`/api/bills${qs}`);
}

export async function createBillClient(bill: Omit<Bill, 'id' | 'created_at' | 'bill_number' | 'gst_amount' | 'total'>): Promise<Bill> {
  return api<Bill>('/api/bills', {
    method: 'POST',
    body: JSON.stringify(bill),
  });
}

export async function getBillByIdClient(id: string): Promise<Bill | null> {
  return api<Bill>(`/api/bills?id=${encodeURIComponent(id)}`);
}

// Reminders
export async function getRemindersClient(): Promise<Bill[]> {
  const data = await api<{success: boolean; reminders: Bill[]}>('/api/reminders');
  return data.reminders || [];
}

export async function sendWhatsAppReminderClient(billId: string): Promise<{success: boolean; message?: string; error?: string; simulated?: boolean}> {
  return api('/api/reminders', {
    method: 'POST',
    body: JSON.stringify({ billId }),
  });
}

// Catalog
export async function getServiceCatalogClient(): Promise<ServiceItem[]> {
  return api<ServiceItem[]>('/api/catalog');
}

// Stats
export async function getBillStatsClient(): Promise<{total_bills: number; total_revenue: number; pending_bills: number; today_revenue: number}> {
  return api('/api/bills?stats=1');
}
