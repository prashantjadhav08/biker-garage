import { supabase } from '../db/supabase';
import { Bike } from '@/lib/types';

export async function getBikes(): Promise<Bike[]> {
  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bikes:', error);
    throw new Error('Failed to fetch bikes');
  }

  return (data || []).map(row => mapBikeRow(row));
}

export async function createBike(bike: Omit<Bike, 'id' | 'created_at'>): Promise<Bike> {
  const { data, error } = await supabase
    .from('bikes')
    .insert({
      bike_number: bike.bike_number.toUpperCase(),
      bike_name: bike.bike_name,
      customer_name: bike.customer_name,
      mobile: bike.mobile,
      status: bike.status || 'Active',
      notes: bike.notes || '',
      mechanic_name: bike.mechanic_name || '',
      estimated_time: bike.estimated_time || '',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating bike:', error);
    throw new Error(error.message || 'Failed to create bike');
  }

  return mapBikeRow(data);
}

export async function updateBike(id: string, bike: Partial<Bike>): Promise<Bike> {
  const existing = await getBikeById(id);
  if (!existing) throw new Error('Bike not found');

  const updates: any = {};
  if (bike.bike_number !== undefined) updates.bike_number = bike.bike_number.toUpperCase();
  if (bike.bike_name !== undefined) updates.bike_name = bike.bike_name;
  if (bike.customer_name !== undefined) updates.customer_name = bike.customer_name;
  if (bike.mobile !== undefined) updates.mobile = bike.mobile;
  if (bike.status !== undefined) updates.status = bike.status;
  if (bike.notes !== undefined) updates.notes = bike.notes;
  if (bike.mechanic_name !== undefined) updates.mechanic_name = bike.mechanic_name;
  if (bike.estimated_time !== undefined) updates.estimated_time = bike.estimated_time;

  if (Object.keys(updates).length === 0) return existing;

  const { data, error } = await supabase
    .from('bikes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating bike:', error);
    throw new Error(error.message || 'Failed to update bike');
  }

  return mapBikeRow(data);
}

export async function deleteBike(id: string): Promise<void> {
  const { error } = await supabase
    .from('bikes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bike:', error);
    throw new Error(error.message || 'Failed to delete bike');
  }
}

export async function getBikeById(id: string): Promise<Bike | null> {
  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    console.error('Error fetching bike by id:', error);
    throw new Error('Failed to fetch bike');
  }

  return mapBikeRow(data);
}

export async function searchBikes(query: string): Promise<Bike[]> {
  const q = `%${query}%`;
  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .or(`bike_number.ilike.${q},bike_name.ilike.${q},customer_name.ilike.${q},mobile.ilike.${q}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching bikes:', error);
    throw new Error('Failed to search bikes');
  }

  return (data || []).map(row => mapBikeRow(row));
}

function mapBikeRow(row: any): Bike {
  return {
    id: String(row.id),
    bike_number: row.bike_number,
    bike_name: row.bike_name,
    customer_name: row.customer_name,
    mobile: row.mobile,
    status: row.status,
    notes: row.notes || '',
    mechanic_name: row.mechanic_name || '',
    estimated_time: row.estimated_time || '',
    created_at: row.created_at,
  };
}
