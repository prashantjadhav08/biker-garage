import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'garage.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bikes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bike_number TEXT NOT NULL UNIQUE,
      bike_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      notes TEXT DEFAULT '',
      mechanic_name TEXT DEFAULT '',
      estimated_time TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_number TEXT NOT NULL UNIQUE,
      bike_id INTEGER,
      bike_number TEXT NOT NULL,
      bike_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      service_desc TEXT NOT NULL,
      service_items TEXT DEFAULT '[]',
      parts_items TEXT DEFAULT '[]',
      service_amount REAL DEFAULT 0,
      parts_amount REAL DEFAULT 0,
      gst_percent REAL DEFAULT 18,
      gst_amount REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'General',
      quantity INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      min_stock INTEGER DEFAULT 5,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_items_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL UNIQUE,
      item_type TEXT NOT NULL,
      default_price REAL DEFAULT 0,
      category TEXT DEFAULT 'General',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing tables: add new columns if they don't exist
  try { db.exec(`ALTER TABLE bikes ADD COLUMN mechanic_name TEXT DEFAULT ''`); } catch (e) { /* exists */ }
  try { db.exec(`ALTER TABLE bikes ADD COLUMN estimated_time TEXT DEFAULT ''`); } catch (e) { /* exists */ }
  try { db.exec(`ALTER TABLE bills ADD COLUMN paid_amount REAL DEFAULT 0`); } catch (e) { /* exists */ }

  // Seed default admin if none exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existing) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
  }

  // Seed default staff if none exists
  const existingStaff = db.prepare('SELECT id FROM users WHERE username = ?').get('staff');
  if (!existingStaff) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync(process.env.STAFF_PASSWORD || 'Staff@123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('staff', hash, 'staff');
  }

  // Seed default service items catalog if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM service_items_catalog').get() as { count: number };
  if (count.count === 0) {
    const items = [
      { item_name: 'Oil Change', item_type: 'Service', default_price: 350, category: 'Maintenance' },
      { item_name: 'Chain Lubrication', item_type: 'Service', default_price: 100, category: 'Maintenance' },
      { item_name: 'Brake Pad Replacement', item_type: 'Service', default_price: 450, category: 'Repair' },
      { item_name: 'Spark Plug Replacement', item_type: 'Service', default_price: 200, category: 'Repair' },
      { item_name: 'Air Filter Cleaning', item_type: 'Service', default_price: 150, category: 'Maintenance' },
      { item_name: 'Tire Puncture', item_type: 'Service', default_price: 80, category: 'Repair' },
      { item_name: 'General Service', item_type: 'Service', default_price: 500, category: 'Maintenance' },
      { item_name: 'Engine Oil (1L)', item_type: 'Part', default_price: 280, category: 'Oil' },
      { item_name: 'Brake Pads (Front)', item_type: 'Part', default_price: 320, category: 'Brakes' },
      { item_name: 'Brake Pads (Rear)', item_type: 'Part', default_price: 280, category: 'Brakes' },
      { item_name: 'Spark Plug', item_type: 'Part', default_price: 120, category: 'Engine' },
      { item_name: 'Air Filter', item_type: 'Part', default_price: 180, category: 'Filter' },
      { item_name: 'Chain Lube', item_type: 'Part', default_price: 150, category: 'Lubricant' },
      { item_name: 'Clutch Cable', item_type: 'Part', default_price: 200, category: 'Cable' },
      { item_name: 'Throttle Cable', item_type: 'Part', default_price: 180, category: 'Cable' },
    ];
    const insert = db.prepare(
      'INSERT INTO service_items_catalog (item_name, item_type, default_price, category) VALUES (?, ?, ?, ?)'
    );
    for (const item of items) {
      insert.run(item.item_name, item.item_type, item.default_price, item.category);
    }
  }
}
