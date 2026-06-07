import { supabase } from '../db/supabase';
import { Part } from '@/lib/types';

export async function getParts(): Promise<Part[]> {
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching parts:', error);
    throw new Error('Failed to fetch parts');
  }

  return (data || []).map(row => mapPartRow(row));
}

export async function createPart(part: Omit<Part, 'id' | 'created_at'>): Promise<Part> {
  const { data, error } = await supabase
    .from('parts')
    .insert({
      name: part.name,
      category: part.category || 'General',
      quantity: part.quantity || 0,
      price: part.price || 0,
      min_stock: part.min_stock || 5,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating part:', error);
    throw new Error(error.message || 'Failed to create part');
  }

  return mapPartRow(data);
}

export async function updatePart(id: string, part: Partial<Part>): Promise<Part | null> {
  const existing = await getPartById(id);
  if (!existing) return null;

  const updates: any = {};
  if (part.name !== undefined) updates.name = part.name;
  if (part.category !== undefined) updates.category = part.category;
  if (part.quantity !== undefined) updates.quantity = part.quantity;
  if (part.price !== undefined) updates.price = part.price;
  if (part.min_stock !== undefined) updates.min_stock = part.min_stock;

  if (Object.keys(updates).length === 0) return existing;

  const { data, error } = await supabase
    .from('parts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating part:', error);
    throw new Error(error.message || 'Failed to update part');
  }

  return mapPartRow(data);
}

export async function deletePart(id: string): Promise<void> {
  const { error } = await supabase
    .from('parts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting part:', error);
    throw new Error(error.message || 'Failed to delete part');
  }
}

export async function getPartById(id: string): Promise<Part | null> {
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching part by id:', error);
    throw new Error('Failed to fetch part');
  }

  return mapPartRow(data);
}

function mapPartRow(row: any): Part {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    quantity: row.quantity || 0,
    price: row.price || 0,
    min_stock: row.min_stock || 5,
    created_at: row.created_at,
  };
}
