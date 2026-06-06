export interface Bike {
  id: string;
  bike_number: string;
  bike_name: string;
  customer_name: string;
  mobile: string;
  status?: string;
  notes?: string;
  mechanic_name?: string;
  estimated_time?: string;
  created_at: string;
}

export interface BillItem {
  name: string;
  price: number;
}

export interface Bill {
  id: string;
  bill_number: string;
  bike_id: string;
  bike_number: string;
  bike_name: string;
  customer_name: string;
  mobile: string;
  service_desc: string;
  service_items: BillItem[];
  parts_items: BillItem[];
  service_amount: number;
  parts_amount: number;
  gst_percent: number;
  gst_amount: number;
  discount: number;
  total: number;
  paid_amount?: number;
  payment_status?: string;
  created_at: string;
}

export interface Part {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  min_stock: number;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  type: string;
  price: number;
  category: string;
}

export type TabType = 'bikes' | 'billing' | 'history';
