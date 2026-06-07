import { supabase } from '../db/supabase';
import { Bill, ServiceItem } from '@/lib/types';

export async function getBills(days?: number): Promise<Bill[]> {
  let query = supabase
    .from('bills')
    .select('*')
    .order('created_at', { ascending: false });

  if (typeof days === 'number' && days > 0) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    query = query.gte('created_at', since.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bills:', error);
    throw new Error('Failed to fetch bills');
  }

  return (data || []).map(row => parseBillRow(row));
}

export async function createBill(bill: Omit<Bill, 'id' | 'created_at' | 'bill_number' | 'gst_amount' | 'total'>): Promise<Bill> {
  const subtotal = (bill.service_amount || 0) + (bill.parts_amount || 0);
  const gst_amount = subtotal * ((bill.gst_percent || 18) / 100);
  const total = Math.max(0, subtotal + gst_amount - (bill.discount || 0));
  const bill_number = `CK${Date.now().toString().slice(-6)}`;
  const paid_amount = bill.paid_amount || 0;

  const { data, error } = await supabase
    .from('bills')
    .insert({
      bill_number,
      bike_id: bill.bike_id || null,
      bike_number: bill.bike_number || '',
      bike_name: bill.bike_name || '',
      customer_name: bill.customer_name || '',
      mobile: bill.mobile || '',
      service_desc: bill.service_desc,
      service_items: bill.service_items || [],
      parts_items: bill.parts_items || [],
      service_amount: bill.service_amount || 0,
      parts_amount: bill.parts_amount || 0,
      gst_percent: bill.gst_percent || 18,
      gst_amount,
      discount: bill.discount || 0,
      total,
      paid_amount,
      payment_status: bill.payment_status || 'Pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating bill:', error);
    throw new Error(error.message || 'Failed to create bill');
  }

  return parseBillRow(data);
}

export async function updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
  const existing = await getBillById(id);
  if (!existing) return null;

  const fields: any = {};
  if (updates.payment_status !== undefined) fields.payment_status = updates.payment_status;
  if (updates.paid_amount !== undefined) fields.paid_amount = updates.paid_amount;

  if (Object.keys(fields).length === 0) return existing;

  const { data, error } = await supabase
    .from('bills')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating bill:', error);
    throw new Error(error.message || 'Failed to update bill');
  }

  return parseBillRow(data);
}

export async function getBillById(id: string): Promise<Bill | null> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching bill by id:', error);
    throw new Error('Failed to fetch bill');
  }

  return parseBillRow(data);
}

export async function getReminders(): Promise<Bill[]> {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const startWindow = new Date(threeMonthsAgo);
  startWindow.setDate(startWindow.getDate() - 7);
  const endWindow = new Date(threeMonthsAgo);
  endWindow.setDate(endWindow.getDate() + 7);

  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .gte('created_at', startWindow.toISOString())
    .lte('created_at', endWindow.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reminders:', error);
    throw new Error('Failed to fetch reminders');
  }

  return (data || []).map(row => parseBillRow(row));
}

export async function getBillStats() {
  const { count: totalBillsCount, error: totalBillsErr } = await supabase
    .from('bills')
    .select('*', { count: 'exact', head: true });

  const { data: totalRevenueData, error: totalRevenueErr } = await supabase
    .from('bills')
    .select('total')
    .eq('payment_status', 'Paid');

  const { count: pendingBillsCount, error: pendingBillsErr } = await supabase
    .from('bills')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'Pending');

  const today = new Date().toISOString().split('T')[0];
  const { data: todayRevenueData, error: todayRevenueErr } = await supabase
    .from('bills')
    .select('total')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lte('created_at', `${today}T23:59:59.999Z`)
    .eq('payment_status', 'Paid');

  const { count: inProgressBikesCount, error: inProgressErr } = await supabase
    .from('bikes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'In Progress');

  const { count: readyForPickupBikesCount, error: readyErr } = await supabase
    .from('bikes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Ready for Pickup');

  const totalRevenue = (totalRevenueData || []).reduce((sum: number, row: any) => sum + (row.total || 0), 0);
  const todayRevenue = (todayRevenueData || []).reduce((sum: number, row: any) => sum + (row.total || 0), 0);

  return {
    total_bills: totalBillsCount ?? 0,
    total_revenue: totalRevenue,
    pending_bills: pendingBillsCount ?? 0,
    today_revenue: todayRevenue,
    in_progress_bikes: inProgressBikesCount ?? 0,
    ready_for_pickup_bikes: readyForPickupBikesCount ?? 0,
  };
}

export function sendWhatsAppReminder(billId: string): { success: boolean; message?: string; simulated?: boolean } {
  return {
    success: true,
    message: 'Reminder sent successfully (SIMULATION MODE - no actual message sent)',
    simulated: true,
  };
}

export async function getServiceCatalog(): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from('service_items_catalog')
    .select('*')
    .eq('is_active', 1)
    .order('item_name');

  if (error) {
    console.error('Error fetching service catalog:', error);
    throw new Error('Failed to fetch service catalog');
  }

  return (data || []).map(row => ({
    id: String(row.id),
    name: row.item_name,
    type: row.item_type,
    price: row.default_price,
    category: row.category,
  }));
}

function parseBillRow(row: any): Bill {
  return {
    id: String(row.id),
    bill_number: row.bill_number,
    bike_id: row.bike_id ? String(row.bike_id) : '',
    bike_number: row.bike_number,
    bike_name: row.bike_name,
    customer_name: row.customer_name,
    mobile: row.mobile,
    service_desc: row.service_desc,
    service_items: Array.isArray(row.service_items) ? row.service_items : (typeof row.service_items === 'string' ? JSON.parse(row.service_items) : []),
    parts_items: Array.isArray(row.parts_items) ? row.parts_items : (typeof row.parts_items === 'string' ? JSON.parse(row.parts_items) : []),
    service_amount: row.service_amount || 0,
    parts_amount: row.parts_amount || 0,
    gst_percent: row.gst_percent || 18,
    gst_amount: row.gst_amount || 0,
    discount: row.discount || 0,
    total: row.total || 0,
    paid_amount: row.paid_amount || 0,
    payment_status: row.payment_status || 'Pending',
    created_at: row.created_at,
  };
}
