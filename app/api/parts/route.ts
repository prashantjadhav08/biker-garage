import { NextRequest, NextResponse } from 'next/server';
import { getParts, createPart, updatePart, deletePart } from '@/lib/services/parts';
import { jsonResponse, optionsResponse } from '@/lib/api/cors';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { getPartById } = await import('@/lib/services/parts');
      const part = getPartById(id);
      if (!part) {
        return jsonResponse({ error: 'Part not found' }, 404);
      }
      return jsonResponse(part);
    }

    const parts = getParts();
    return jsonResponse(parts);
  } catch (error: any) {
    console.error('Error fetching parts:', error);
    return jsonResponse({ error: 'Failed to fetch parts' }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, quantity, price, min_stock } = body;

    if (!name) {
      return jsonResponse({ error: 'Part name is required' }, 400);
    }

    const part = createPart({
      name,
      category: category || 'General',
      quantity: parseInt(quantity) || 0,
      price: parseFloat(price) || 0,
      min_stock: parseInt(min_stock) || 5,
    });

    return jsonResponse(part, 201);
  } catch (error: any) {
    console.error('Error creating part:', error);
    return jsonResponse({ error: error.message || 'Failed to create part' }, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return jsonResponse({ error: 'Part ID is required' }, 400);
    }

    const part = updatePart(id, {
      name: updates.name,
      category: updates.category,
      quantity: updates.quantity !== undefined ? parseInt(updates.quantity) : undefined,
      price: updates.price !== undefined ? parseFloat(updates.price) : undefined,
      min_stock: updates.min_stock !== undefined ? parseInt(updates.min_stock) : undefined,
    });

    if (!part) {
      return jsonResponse({ error: 'Part not found' }, 404);
    }

    return jsonResponse(part);
  } catch (error: any) {
    console.error('Error updating part:', error);
    return jsonResponse({ error: error.message || 'Failed to update part' }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return jsonResponse({ error: 'Part ID required' }, 400);
    }

    deletePart(id);
    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error deleting part:', error);
    return jsonResponse({ error: error.message || 'Failed to delete part' }, 500);
  }
}
