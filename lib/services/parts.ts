import { getDb } from '../db/connection';
import { Part } from '@/lib/types';

export function getParts(): Part[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM parts ORDER BY name ASC').all() as any[];
  return rows.map(row => ({
    id: String(row.id),
    name: row.name,
    category: row.category,
    quantity: row.quantity || 0,
    price: row.price || 0,
    min_stock: row.min_stock || 5,
    created_at: row.created_at,
  }));
}

export function createPart(part: Omit<Part, 'id' | 'created_at'>): Part {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO parts (name, category, quantity, price, min_stock) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    part.name,
    part.category || 'General',
    part.quantity || 0,
    part.price || 0,
    part.min_stock || 5
  );
  return {
    id: String(result.lastInsertRowid),
    name: part.name,
    category: part.category || 'General',
    quantity: part.quantity || 0,
    price: part.price || 0,
    min_stock: part.min_stock || 5,
    created_at: new Date().toISOString(),
  };
}

export function updatePart(id: string, part: Partial<Part>): Part | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM parts WHERE id = ?').get(id) as any;
  if (!existing) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (part.name !== undefined) { fields.push('name = ?'); values.push(part.name); }
  if (part.category !== undefined) { fields.push('category = ?'); values.push(part.category); }
  if (part.quantity !== undefined) { fields.push('quantity = ?'); values.push(part.quantity); }
  if (part.price !== undefined) { fields.push('price = ?'); values.push(part.price); }
  if (part.min_stock !== undefined) { fields.push('min_stock = ?'); values.push(part.min_stock); }

  if (fields.length === 0) return getPartById(id);

  values.push(id);
  db.prepare(`UPDATE parts SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getPartById(id);
}

export function deletePart(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM parts WHERE id = ?').run(id);
}

export function getPartById(id: string): Part | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM parts WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    quantity: row.quantity || 0,
    price: row.price || 0,
    min_stock: row.min_stock || 5,
    created_at: row.created_at,
  };
}
