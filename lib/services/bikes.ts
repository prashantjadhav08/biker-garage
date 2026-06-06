import { getDb } from '../db/connection';
import { Bike } from '@/lib/types';

export function getBikes(): Bike[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM bikes ORDER BY created_at DESC').all() as any[];
  return rows.map(row => ({
    id: String(row.id),
    bike_number: row.bike_number,
    bike_name: row.bike_name,
    customer_name: row.customer_name,
    mobile: row.mobile,
    status: row.status,
    notes: row.notes || '',
    mechanic_name: row.mechanic_name || '',
    estimated_time: row.estimated_time || '',
    created_at: row.created_at,
  }));
}

export function createBike(bike: Omit<Bike, 'id' | 'created_at'>): Bike {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO bikes (bike_number, bike_name, customer_name, mobile, status, notes, mechanic_name, estimated_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    bike.bike_number.toUpperCase(),
    bike.bike_name,
    bike.customer_name,
    bike.mobile,
    bike.status || 'Active',
    bike.notes || '',
    bike.mechanic_name || '',
    bike.estimated_time || ''
  );
  return {
    id: String(result.lastInsertRowid),
    bike_number: bike.bike_number.toUpperCase(),
    bike_name: bike.bike_name,
    customer_name: bike.customer_name,
    mobile: bike.mobile,
    status: bike.status || 'Active',
    notes: bike.notes || '',
    mechanic_name: bike.mechanic_name || '',
    estimated_time: bike.estimated_time || '',
    created_at: new Date().toISOString(),
  };
}

export function updateBike(id: string, bike: Partial<Bike>): Bike {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM bikes WHERE id = ?').get(id) as any;
  if (!existing) throw new Error('Bike not found');

  const fields: string[] = [];
  const values: any[] = [];

  if (bike.bike_number !== undefined) { fields.push('bike_number = ?'); values.push(bike.bike_number.toUpperCase()); }
  if (bike.bike_name !== undefined) { fields.push('bike_name = ?'); values.push(bike.bike_name); }
  if (bike.customer_name !== undefined) { fields.push('customer_name = ?'); values.push(bike.customer_name); }
  if (bike.mobile !== undefined) { fields.push('mobile = ?'); values.push(bike.mobile); }
  if (bike.status !== undefined) { fields.push('status = ?'); values.push(bike.status); }
  if (bike.notes !== undefined) { fields.push('notes = ?'); values.push(bike.notes); }
  if (bike.mechanic_name !== undefined) { fields.push('mechanic_name = ?'); values.push(bike.mechanic_name); }
  if (bike.estimated_time !== undefined) { fields.push('estimated_time = ?'); values.push(bike.estimated_time); }

  if (fields.length === 0) return getBikeById(id)!;

  values.push(id);
  db.prepare(`UPDATE bikes SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getBikeById(id)!;
}

export function deleteBike(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM bikes WHERE id = ?').run(id);
}

export function getBikeById(id: string): Bike | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM bikes WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    id: String(row.id),
    bike_number: row.bike_number,
    bike_name: row.bike_name,
    customer_name: row.customer_name,
    mobile: row.mobile,
    status: row.status,
    notes: row.notes || '',
    mechanic_name: row.mechanic_name || '',
    estimated_time: row.estimated_time || '',
    created_at: row.created_at,
  };
}

export function searchBikes(query: string): Bike[] {
  const db = getDb();
  const q = `%${query}%`;
  const rows = db.prepare(
    'SELECT * FROM bikes WHERE bike_number LIKE ? OR bike_name LIKE ? OR customer_name LIKE ? OR mobile LIKE ? ORDER BY created_at DESC'
  ).all(q, q, q, q) as any[];
  return rows.map(row => ({
    id: String(row.id),
    bike_number: row.bike_number,
    bike_name: row.bike_name,
    customer_name: row.customer_name,
    mobile: row.mobile,
    status: row.status,
    notes: row.notes || '',
    mechanic_name: row.mechanic_name || '',
    estimated_time: row.estimated_time || '',
    created_at: row.created_at,
  }));
}
