import { supabase, isSupabaseConfigured } from './supabase';
import { Bike, Bill } from './types';

// ==================== LOCAL STORAGE FALLBACK ====================

function getBikesFromLocalStorage(): Bike[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('chakra_bikes');
  return stored ? JSON.parse(stored) : [];
}

function saveBikesToLocalStorage(bikes: Bike[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('chakra_bikes', JSON.stringify(bikes));
}

function getBillsFromLocalStorage(): Bill[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('chakra_bills');
  return stored ? JSON.parse(stored) : [];
}

function saveBillsToLocalStorage(bills: Bill[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('chakra_bills', JSON.stringify(bills));
}

// ==================== BIKES ====================

export async function getBikes(): Promise<Bike[]> {
  // Use localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return getBikesFromLocalStorage();
  }

  try {
    const { data, error } = await supabase!
      .from('bikes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bikes:', error);
      return getBikesFromLocalStorage();
    }

    return data || [];
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    return getBikesFromLocalStorage();
  }
}

export async function createBike(bike: Omit<Bike, 'id' | 'created_at'>): Promise<Bike> {
  const newBike: Bike = {
    id: Date.now().toString(),
    ...bike,
    bike_number: bike.bike_number.toUpperCase(),
    created_at: new Date().toISOString(),
  };

  // Use localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    const bikes = getBikesFromLocalStorage();
    bikes.unshift(newBike);
    saveBikesToLocalStorage(bikes);
    return newBike;
  }

  try {
    const { data, error } = await supabase!
      .from('bikes')
      .insert(newBike)
      .select()
      .single();

    if (error) {
      console.error('Error creating bike:', error);
      // Fallback to localStorage
      const bikes = getBikesFromLocalStorage();
      bikes.unshift(newBike);
      saveBikesToLocalStorage(bikes);
      return newBike;
    }

    return data;
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    const bikes = getBikesFromLocalStorage();
    bikes.unshift(newBike);
    saveBikesToLocalStorage(bikes);
    return newBike;
  }
}

export async function updateBike(id: string, bike: Partial<Bike>): Promise<Bike> {
  // Use localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    const bikes = getBikesFromLocalStorage();
    const index = bikes.findIndex(b => b.id === id);
    if (index !== -1) {
      bikes[index] = { ...bikes[index], ...bike, bike_number: bike.bike_number?.toUpperCase() || bikes[index].bike_number };
      saveBikesToLocalStorage(bikes);
      return bikes[index];
    }
    throw new Error('Bike not found');
  }

  try {
    const { data, error } = await supabase!
      .from('bikes')
      .update({ ...bike, bike_number: bike.bike_number?.toUpperCase() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bike:', error);
      // Fallback to localStorage
      const bikes = getBikesFromLocalStorage();
      const index = bikes.findIndex(b => b.id === id);
      if (index !== -1) {
        bikes[index] = { ...bikes[index], ...bike, bike_number: bike.bike_number?.toUpperCase() || bikes[index].bike_number };
        saveBikesToLocalStorage(bikes);
        return bikes[index];
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    const bikes = getBikesFromLocalStorage();
    const index = bikes.findIndex(b => b.id === id);
    if (index !== -1) {
      bikes[index] = { ...bikes[index], ...bike, bike_number: bike.bike_number?.toUpperCase() || bikes[index].bike_number };
      saveBikesToLocalStorage(bikes);
      return bikes[index];
    }
    throw error;
  }
}

export async function deleteBike(id: string): Promise<void> {
  // Use localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    const bikes = getBikesFromLocalStorage();
    const filtered = bikes.filter(b => b.id !== id);
    saveBikesToLocalStorage(filtered);
    return;
  }

  try {
    const { error } = await supabase!
      .from('bikes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bike:', error);
      // Fallback to localStorage
      const bikes = getBikesFromLocalStorage();
      const filtered = bikes.filter(b => b.id !== id);
      saveBikesToLocalStorage(filtered);
    }
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    const bikes = getBikesFromLocalStorage();
    const filtered = bikes.filter(b => b.id !== id);
    saveBikesToLocalStorage(filtered);
  }
}

// ==================== BILLS ====================

export async function getBills(days?: number): Promise<Bill[]> {
  const filterByDate = typeof days === 'number' && days > 0;
  const daysAgo = new Date();
  if (filterByDate) {
    daysAgo.setDate(daysAgo.getDate() - days);
  }

  // Use localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    const bills = getBillsFromLocalStorage();
    const filtered = filterByDate
      ? bills.filter(b => new Date(b.created_at) >= daysAgo)
      : bills;
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  try {
    let query = supabase!
      .from('bills')
      .select('*');

    if (filterByDate) {
      query = query.gte('created_at', daysAgo.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bills:', error);
      // Fallback to localStorage
      const bills = getBillsFromLocalStorage();
      const filtered = filterByDate
        ? bills.filter(b => new Date(b.created_at) >= daysAgo)
        : bills;
      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return data || [];
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    const bills = getBillsFromLocalStorage();
    const filtered = filterByDate
      ? bills.filter(b => new Date(b.created_at) >= daysAgo)
      : bills;
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function createBill(bill: Omit<Bill, 'id' | 'created_at' | 'bill_number' | 'gst_amount' | 'total'>): Promise<Bill> {
  const subtotal = bill.service_amount + bill.parts_amount;
  const gst_amount = subtotal * (bill.gst_percent / 100);
  const total = Math.max(0, subtotal + gst_amount - bill.discount);

  const newBill: Bill = {
    id: Date.now().toString(),
    bill_number: `CK${Date.now().toString().slice(-6)}`,
    ...bill,
    gst_amount,
    total,
    created_at: new Date().toISOString(),
  };

  // Use localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    const bills = getBillsFromLocalStorage();
    bills.unshift(newBill);
    saveBillsToLocalStorage(bills);
    return newBill;
  }

  try {
    const { data, error } = await supabase!
      .from('bills')
      .insert(newBill)
      .select()
      .single();

    if (error) {
      console.error('Error creating bill:', error);
      // Fallback to localStorage
      const bills = getBillsFromLocalStorage();
      bills.unshift(newBill);
      saveBillsToLocalStorage(bills);
      return newBill;
    }

    return data;
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    const bills = getBillsFromLocalStorage();
    bills.unshift(newBill);
    saveBillsToLocalStorage(bills);
    return newBill;
  }
}

export async function getBillById(id: string): Promise<Bill | null> {
  if (!isSupabaseConfigured()) {
    const bills = getBillsFromLocalStorage();
    return bills.find(b => b.id === id) || null;
  }

  try {
    const { data, error } = await supabase!
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching bill by id:', error);
      const bills = getBillsFromLocalStorage();
      return bills.find(b => b.id === id) || null;
    }

    return data || null;
  } catch (error) {
    console.error('Supabase error, falling back to localStorage:', error);
    const bills = getBillsFromLocalStorage();
    return bills.find(b => b.id === id) || null;
  }
}

export async function getReminders(): Promise<Bill[]> {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // Define a window around 3 months (e.g., 3 months +/- 7 days)
  const startWindow = new Date(threeMonthsAgo);
  startWindow.setDate(startWindow.getDate() - 7);
  const endWindow = new Date(threeMonthsAgo);
  endWindow.setDate(endWindow.getDate() + 7);

  if (!isSupabaseConfigured()) {
    const bills = getBillsFromLocalStorage();
    return bills.filter(b => {
      const date = new Date(b.created_at);
      return date >= startWindow && date <= endWindow;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  try {
    const { data, error } = await supabase!
      .from('bills')
      .select('*')
      .gte('created_at', startWindow.toISOString())
      .lte('created_at', endWindow.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Supabase error fetching reminders:', error);
    return [];
  }
}
