import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured. Data is managed client-side.' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase!
      .from('bikes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bikes:', error);
      return NextResponse.json({ error: 'Failed to fetch bikes' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json({ error: 'Failed to fetch bikes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured. Data is managed client-side.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { bike_number, bike_name, customer_name, mobile } = body;

    if (!bike_number || !bike_name || !customer_name || !mobile) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newBike = {
      id: Date.now().toString(),
      bike_number: bike_number.toUpperCase(),
      bike_name,
      customer_name,
      mobile,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase!
      .from('bikes')
      .insert(newBike)
      .select()
      .single();

    if (error) {
      console.error('Error creating bike:', error);
      return NextResponse.json({ error: 'Failed to create bike' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating bike:', error);
    return NextResponse.json({ error: 'Failed to create bike' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured. Data is managed client-side.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, bike_number, bike_name, customer_name, mobile } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bike ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase!
      .from('bikes')
      .update({
        bike_number: bike_number?.toUpperCase(),
        bike_name,
        customer_name,
        mobile,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bike:', error);
      return NextResponse.json({ error: 'Failed to update bike' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating bike:', error);
    return NextResponse.json({ error: 'Failed to update bike' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured. Data is managed client-side.' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bike ID required' }, { status: 400 });
    }

    const { error } = await supabase!
      .from('bikes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bike:', error);
      return NextResponse.json({ error: 'Failed to delete bike' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bike:', error);
    return NextResponse.json({ error: 'Failed to delete bike' }, { status: 500 });
  }
}
