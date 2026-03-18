import { NextRequest, NextResponse } from 'next/server';

function getBikes() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('biker_garage_bikes');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

function saveBikes(bikes: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('biker_garage_bikes', JSON.stringify(bikes));
  }
}

export async function GET() {
  try {
    const bikes = getBikes();
    return NextResponse.json(bikes);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json({ error: 'Failed to fetch bikes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bike_number, bike_name, customer_name, mobile } = body;

    if (!bike_number || !bike_name || !customer_name || !mobile) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const bikes = getBikes();
    
    if (bikes.some((b: any) => b.bike_number?.toLowerCase() === bike_number?.toLowerCase())) {
      return NextResponse.json({ error: 'Bike number already exists' }, { status: 400 });
    }

    const newBike = {
      id: Date.now().toString(),
      bike_number: bike_number.toUpperCase(),
      bike_name,
      customer_name,
      mobile,
      created_at: new Date().toISOString(),
    };

    const updatedBikes = [newBike, ...bikes];
    saveBikes(updatedBikes);

    return NextResponse.json(newBike, { status: 201 });
  } catch (error) {
    console.error('Error creating bike:', error);
    return NextResponse.json({ error: 'Failed to create bike' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, bike_number, bike_name, customer_name, mobile } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bike ID is required' }, { status: 400 });
    }

    const bikes = getBikes();
    const index = bikes.findIndex((b: any) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    bikes[index] = {
      ...bikes[index],
      bike_number: bike_number.toUpperCase(),
      bike_name,
      customer_name,
      mobile,
    };

    saveBikes(bikes);

    return NextResponse.json(bikes[index]);
  } catch (error) {
    console.error('Error updating bike:', error);
    return NextResponse.json({ error: 'Failed to update bike' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bike ID required' }, { status: 400 });
    }

    const bikes = getBikes();
    const filtered = bikes.filter((b: any) => b.id !== id);
    saveBikes(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bike:', error);
    return NextResponse.json({ error: 'Failed to delete bike' }, { status: 500 });
  }
}
