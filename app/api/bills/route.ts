import { NextRequest, NextResponse } from 'next/server';

function getBills() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('biker_garage_bills');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

function saveBills(bills: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('biker_garage_bills', JSON.stringify(bills));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';
    const id = searchParams.get('id');

    const bills = getBills();

    if (id) {
      const bill = bills.find((b: any) => b.id === id);
      if (!bill) {
        return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
      }
      return NextResponse.json(bill);
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const filtered = bills.filter((b: any) => new Date(b.created_at) >= daysAgo);
    const sorted = filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bike_id,
      bike_number,
      bike_name,
      customer_name,
      mobile,
      service_desc,
      service_amount,
      parts_amount,
      gst_percent,
      discount,
    } = body;

    if (!service_desc) {
      return NextResponse.json({ error: 'Service description is required' }, { status: 400 });
    }

    const serviceAmt = parseFloat(service_amount) || 0;
    const partsAmt = parseFloat(parts_amount) || 0;
    const gstPct = parseFloat(gst_percent) || 18;
    const discountAmt = parseFloat(discount) || 0;

    const subtotal = serviceAmt + partsAmt;
    const gst_amount = subtotal * (gstPct / 100);
    const total = subtotal + gst_amount - discountAmt;

    const bill_number = `BG${Date.now().toString().slice(-6)}`;

    const newBill = {
      id: Date.now().toString(),
      bill_number,
      bike_id: bike_id || null,
      bike_number: bike_number?.toUpperCase() || '',
      bike_name: bike_name || '',
      customer_name: customer_name || '',
      mobile: mobile || '',
      service_desc,
      service_amount: serviceAmt,
      parts_amount: partsAmt,
      gst_percent: gstPct,
      gst_amount,
      discount: discountAmt,
      total,
      created_at: new Date().toISOString(),
    };

    const bills = getBills();
    const updatedBills = [newBill, ...bills];
    saveBills(updatedBills);

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
