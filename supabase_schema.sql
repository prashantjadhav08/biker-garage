-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/rfscxcglgiyohzrmegqs/sql
-- Then press "Run"

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bikes table
CREATE TABLE IF NOT EXISTS bikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bike_number TEXT NOT NULL UNIQUE,
  bike_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  notes TEXT DEFAULT '',
  mechanic_name TEXT DEFAULT '',
  estimated_time TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number TEXT NOT NULL UNIQUE,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  bike_number TEXT NOT NULL,
  bike_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  service_desc TEXT NOT NULL,
  service_items JSONB DEFAULT '[]',
  parts_items JSONB DEFAULT '[]',
  service_amount REAL DEFAULT 0,
  parts_amount REAL DEFAULT 0,
  gst_percent REAL DEFAULT 18,
  gst_amount REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  total REAL DEFAULT 0,
  paid_amount REAL DEFAULT 0,
  payment_status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parts inventory table
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'General',
  quantity INTEGER DEFAULT 0,
  price REAL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service items catalog
CREATE TABLE IF NOT EXISTS service_items_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL UNIQUE,
  item_type TEXT NOT NULL,
  default_price REAL DEFAULT 0,
  category TEXT DEFAULT 'General',
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bikes_status ON bikes(status);
CREATE INDEX IF NOT EXISTS idx_bikes_mobile ON bikes(mobile);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name);
CREATE INDEX IF NOT EXISTS idx_service_catalog_type ON service_items_catalog(item_type);

-- Seed default service items catalog
INSERT INTO service_items_catalog (item_name, item_type, default_price, category)
VALUES
  ('Oil Change', 'Service', 350, 'Maintenance'),
  ('Chain Lubrication', 'Service', 100, 'Maintenance'),
  ('Brake Pad Replacement', 'Service', 450, 'Repair'),
  ('Spark Plug Replacement', 'Service', 200, 'Repair'),
  ('Air Filter Cleaning', 'Service', 150, 'Maintenance'),
  ('Tire Puncture', 'Service', 80, 'Repair'),
  ('General Service', 'Service', 500, 'Maintenance'),
  ('Engine Oil (1L)', 'Part', 280, 'Oil'),
  ('Brake Pads (Front)', 'Part', 320, 'Brakes'),
  ('Brake Pads (Rear)', 'Part', 280, 'Brakes'),
  ('Spark Plug', 'Part', 120, 'Engine'),
  ('Air Filter', 'Part', 180, 'Filter'),
  ('Chain Lube', 'Part', 150, 'Lubricant'),
  ('Clutch Cable', 'Part', 200, 'Cable'),
  ('Throttle Cable', 'Part', 180, 'Cable')
ON CONFLICT (item_name) DO NOTHING;
