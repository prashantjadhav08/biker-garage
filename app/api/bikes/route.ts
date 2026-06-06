import { NextRequest, NextResponse } from 'next/server';
import { getBikes, createBike, updateBike, deleteBike, getBikeById } from '@/lib/services/bikes';
import { jsonResponse, optionsResponse } from '@/lib/api/cors';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const id = searchParams.get('id');

    if (id) {
      const bike = getBikeById(id);
      if (!bike) {
        return jsonResponse({ error: 'Bike not found' }, 404);
      }
      return jsonResponse(bike);
    }

    if (query) {
      const { searchBikes } = await import('@/lib/services/bikes');
      const bikes = searchBikes(query);
      return jsonResponse(bikes);
    }

    const bikes = getBikes();
    return jsonResponse(bikes);
  } catch (error: any) {
    console.error('Error fetching bikes:', error);
    return jsonResponse({ error: 'Failed to fetch bikes' }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bike_number, bike_name, customer_name, mobile, status, notes, mechanic_name, estimated_time } = body;

    if (!bike_number || !bike_name || !customer_name || !mobile) {
      return jsonResponse({ error: 'All fields are required' }, 400);
    }

    const bike = createBike({
      bike_number,
      bike_name,
      customer_name,
      mobile,
      status: status || 'Active',
      notes: notes || '',
      mechanic_name: mechanic_name || '',
      estimated_time: estimated_time || '',
    });

    return jsonResponse(bike, 201);
  } catch (error: any) {
    console.error('Error creating bike:', error);
    return jsonResponse({ error: error.message || 'Failed to create bike' }, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return jsonResponse({ error: 'Bike ID is required' }, 400);
    }

    const bike = updateBike(id, updates);
    return jsonResponse(bike);
  } catch (error: any) {
    console.error('Error updating bike:', error);
    return jsonResponse({ error: error.message || 'Failed to update bike' }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return jsonResponse({ error: 'Bike ID required' }, 400);
    }

    deleteBike(id);
    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error deleting bike:', error);
    return jsonResponse({ error: error.message || 'Failed to delete bike' }, 500);
  }
}
