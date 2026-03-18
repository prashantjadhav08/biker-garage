export interface Bike {
  id: string;
  bike_number: string;
  bike_name: string;
  customer_name: string;
  mobile: string;
  created_at: string;
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
  service_amount: number;
  parts_amount: number;
  gst_percent: number;
  gst_amount: number;
  discount: number;
  total: number;
  created_at: string;
}

export type TabType = 'bikes' | 'billing' | 'history';
