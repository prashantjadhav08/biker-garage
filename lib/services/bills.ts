import { getDb } from '../db/connection';
import { Bill, ServiceItem } from '@/lib/types';

export function getBills(days?: number): Bill[] {
  const db = getDb();
  let sql = 'SELECT * FROM bills ORDER BY created_at DESC';
  let rows: any[];

  if (typeof days === 'number' && days > 0) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    sql = 'SELECT * FROM bills WHERE created_at >= ? ORDER BY created_at DESC';
    rows = db.prepare(sql).all(since.toISOString()) as any[];
  } else {
    rows = db.prepare(sql).all() as any[];
  }

  return rows.map(parseBillRow);
}

export function createBill(bill: Omit<Bill, 'id' | 'created_at' | 'bill_number' | 'gst_amount' | 'total'>): Bill {
  const db = getDb();
  const subtotal = bill.service_amount + bill.parts_amount;
  const gst_amount = subtotal * (bill.gst_percent / 100);
  const total = Math.max(0, subtotal + gst_amount - bill.discount);
  const bill_number = `CK${Date.now().toString().slice(-6)}`;
  const paid_amount = bill.paid_amount || 0;

  const stmt = db.prepare(
    `INSERT INTO bills (
      bill_number, bike_id, bike_number, bike_name, customer_name, mobile,
      service_desc, service_items, parts_items, service_amount, parts_amount,
      gst_percent, gst_amount, discount, total, paid_amount, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    bill_number,
    bill.bike_id ? parseInt(bill.bike_id) : null,
    bill.bike_number,
    bill.bike_name,
    bill.customer_name,
    bill.mobile,
    bill.service_desc,
    JSON.stringify(bill.service_items || []),
    JSON.stringify(bill.parts_items || []),
    bill.service_amount,
    bill.parts_amount,
    bill.gst_percent,
    gst_amount,
    bill.discount,
    total,
    paid_amount,
    bill.payment_status || 'Pending'
  );

  return getBillById(String(result.lastInsertRowid))!;
}

export function updateBill(id: string, updates: Partial<Bill>): Bill | null {
  const db = getDb();
  const existing = getBillById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.payment_status !== undefined) { fields.push('payment_status = ?'); values.push(updates.payment_status); }
  if (updates.paid_amount !== undefined) { fields.push('paid_amount = ?'); values.push(updates.paid_amount); }

  if (fields.length === 0) return existing;

  values.push(id);
  db.prepare(`UPDATE bills SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getBillById(id);
}

export function getBillById(id: string): Bill | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM bills WHERE id = ?').get(id) as any;
  if (!row) return null;
  return parseBillRow(row);
}

export function getReminders(): Bill[] {
  const db = getDb();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const startWindow = new Date(threeMonthsAgo);
  startWindow.setDate(startWindow.getDate() - 7);
  const endWindow = new Date(threeMonthsAgo);
  endWindow.setDate(endWindow.getDate() + 7);

  const rows = db.prepare(
    'SELECT * FROM bills WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC'
  ).all(startWindow.toISOString(), endWindow.toISOString()) as any[];

  return rows.map(parseBillRow);
}

export function updateBillPaymentStatus(id: string, status: string): void {
  const db = getDb();
  db.prepare('UPDATE bills SET payment_status = ? WHERE id = ?').run(status, id);
}

export function getBillStats() {
  const db = getDb();
  const totalBills = db.prepare('SELECT COUNT(*) as count FROM bills').get() as { count: number };
  const totalRevenue = db.prepare('SELECT SUM(total) as sum FROM bills WHERE payment_status = ?').get('Paid') as { sum: number };
  const pendingBills = db.prepare('SELECT COUNT(*) as count FROM bills WHERE payment_status = ?').get('Pending') as { count: number };
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = db.prepare('SELECT SUM(total) as sum FROM bills WHERE date(created_at) = ? AND payment_status = ?').get(today, 'Paid') as { sum: number };
  const inProgressBikes = db.prepare("SELECT COUNT(*) as count FROM bikes WHERE status = 'In Progress'").get() as { count: number };
  const readyForPickupBikes = db.prepare("SELECT COUNT(*) as count FROM bikes WHERE status = 'Ready for Pickup'").get() as { count: number };

  return {
    total_bills: totalBills.count,
    total_revenue: totalRevenue.sum || 0,
    pending_bills: pendingBills.count,
    today_revenue: todayRevenue.sum || 0,
    in_progress_bikes: inProgressBikes.count,
    ready_for_pickup_bikes: readyForPickupBikes.count,
  };
}

export function sendWhatsAppReminder(billId: string): {success: boolean; message?: string; simulated?: boolean} {
  return {
    success: true,
    message: 'Reminder sent successfully (SIMULATION MODE - no actual message sent)',
    simulated: true,
  };
}

export function getServiceCatalog(): ServiceItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM service_items_catalog WHERE is_active = 1 ORDER BY item_name').all() as any[];
  return rows.map(row => ({
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
    service_items: typeof row.service_items === 'string' ? JSON.parse(row.service_items) : row.service_items || [],
    parts_items: typeof row.parts_items === 'string' ? JSON.parse(row.parts_items) : row.parts_items || [],
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
