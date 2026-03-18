-- ============================================
-- BIKER GARAGE - DATABASE SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- BIKES TABLE
-- ============================================
CREATE TABLE bikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bike_number VARCHAR(20) NOT NULL UNIQUE,
  bike_name VARCHAR(100) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BILLS TABLE
-- ============================================
CREATE TABLE bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number VARCHAR(20) UNIQUE NOT NULL,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  bike_number VARCHAR(20) NOT NULL,
  bike_name VARCHAR(100) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  service_desc TEXT NOT NULL,
  service_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  parts_amount DECIMAL(10,2) DEFAULT 0,
  gst_percent INTEGER DEFAULT 18,
  gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX idx_bikes_bike_number ON bikes(bike_number);
CREATE INDEX idx_bikes_created_at ON bikes(created_at);
CREATE INDEX idx_bills_bill_number ON bills(bill_number);
CREATE INDEX idx_bills_created_at ON bills(created_at);
CREATE INDEX idx_bills_bike_id ON bills(bike_id);

-- ============================================
-- POLICIES FOR PUBLIC ACCESS
-- (For development - allows all operations)
-- ============================================

-- Bikes policies
DROP POLICY IF EXISTS "Allow all bikes select" ON bikes;
CREATE POLICY "Allow all bikes select" ON bikes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all bikes insert" ON bikes;
CREATE POLICY "Allow all bikes insert" ON bikes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all bikes update" ON bikes;
CREATE POLICY "Allow all bikes update" ON bikes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all bikes delete" ON bikes;
CREATE POLICY "Allow all bikes delete" ON bikes FOR DELETE USING (true);

-- Bills policies
DROP POLICY IF EXISTS "Allow all bills select" ON bills;
CREATE POLICY "Allow all bills select" ON bills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all bills insert" ON bills;
CREATE POLICY "Allow all bills insert" ON bills FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all bills update" ON bills;
CREATE POLICY "Allow all bills update" ON bills FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all bills delete" ON bills;
CREATE POLICY "Allow all bills delete" ON bills FOR DELETE USING (true);

-- ============================================
-- VERIFICATION QUERIES (Optional)
-- ============================================

-- Check if tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
