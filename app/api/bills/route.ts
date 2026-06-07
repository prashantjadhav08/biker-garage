import { NextRequest } from 'next/server';
import { getBills, createBill, getBillById, getBillStats, updateBill } from '@/lib/services/bills';
import { jsonResponse, optionsResponse } from '@/lib/api/cors';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');
    const id = searchParams.get('id');
    const stats = searchParams.get('stats');

    if (stats) {
      const statsData = await getBillStats();
      return jsonResponse(statsData);
    }

    if (id) {
      const bill = await getBillById(id);
      if (!bill) {
        return jsonResponse({ error: 'Bill not found' }, 404);
      }
      return jsonResponse(bill);
    }

    const bills = await getBills(days ? parseInt(days) : undefined);
    return jsonResponse(bills);
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    return jsonResponse({ error: 'Failed to fetch bills' }, 500);
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
      service_items,
      parts_items,
      service_amount,
      parts_amount,
      gst_percent,
      discount,
      payment_status,
      paid_amount,
    } = body;

    if (!service_desc) {
      return jsonResponse({ error: 'Service description is required' }, 400);
    }

    const bill = await createBill({
      bike_id: bike_id || '',
      bike_number: bike_number || '',
      bike_name: bike_name || '',
      customer_name: customer_name || '',
      mobile: mobile || '',
      service_desc,
      service_items: service_items || [],
      parts_items: parts_items || [],
      service_amount: parseFloat(service_amount) || 0,
      parts_amount: parseFloat(parts_amount) || 0,
      gst_percent: parseFloat(gst_percent) || 18,
      discount: parseFloat(discount) || 0,
      payment_status: payment_status || 'Pending',
      paid_amount: parseFloat(paid_amount) || 0,
    });

    return jsonResponse(bill, 201);
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return jsonResponse({ error: error.message || 'Failed to create bill' }, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, payment_status, paid_amount } = body;

    if (!id) {
      return jsonResponse({ error: 'Bill ID is required' }, 400);
    }

    const bill = await updateBill(id, {
      payment_status,
      paid_amount: paid_amount !== undefined ? parseFloat(paid_amount) : undefined,
    });

    if (!bill) {
      return jsonResponse({ error: 'Bill not found' }, 404);
    }

    return jsonResponse(bill);
  } catch (error: any) {
    console.error('Error updating bill:', error);
    return jsonResponse({ error: error.message || 'Failed to update bill' }, 500);
  }
}
