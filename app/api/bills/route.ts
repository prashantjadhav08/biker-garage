import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured. Data is managed client-side.' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase!
        .from('bills')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    let query = supabase!
      .from('bills')
      .select('*');

    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      query = query.gte('created_at', daysAgo.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bills:', error);
      return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured. Data is managed client-side.' }, { status: 503 });
  }

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
    const total = Math.max(0, subtotal + gst_amount - discountAmt);

    const bill_number = `CK${Date.now().toString().slice(-6)}`;

    const newBill = {
      id: Date.now().toString(),
      bill_number,
      bike_id: bike_id || null,
      bike_number: bike_number?.toUpperCase() || '',
      bike_name: bike_name || '',
      customer_name: customer_name || '',
      mobile: mobile || '',
      service_desc,
      service_items: service_items || [],
      parts_items: parts_items || [],
      service_amount: serviceAmt,
      parts_amount: partsAmt,
      gst_percent: gstPct,
      gst_amount,
      discount: discountAmt,
      total,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase!
      .from('bills')
      .insert(newBill)
      .select()
      .single();

    if (error) {
      console.error('Error creating bill:', error);
      return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
