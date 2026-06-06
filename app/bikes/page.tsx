'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBikesClient, createBikeClient, updateBikeClient, deleteBikeClient } from '@/lib/api/client';
import { Bike } from '@/lib/types';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';
import BikeForm from '@/components/BikeForm';
import BikeCard from '@/components/BikeCard';
import Toast from '@/components/Toast';

export default function BikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<Bike[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const data = await getBikesClient();
      setBikes(data);
      setFilteredBikes(data);
    } catch (error) {
      console.error('Error fetching bikes:', error);
      showToastMsg('Failed to fetch bikes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { clearAuthToken(); router.push('/login'); };

  useEffect(() => {
    const f = bikes.filter((b) =>
      b.bike_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bike_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobile?.includes(searchTerm)
    );
    setFilteredBikes(f);
  }, [searchTerm, bikes]);

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async (bikeData: Partial<Bike>) => {
    try {
      if (editingBike) {
        await updateBikeClient(editingBike.id, bikeData);
        showToastMsg('Bike updated successfully', 'success');
      } else {
        await createBikeClient({
          bike_number: bikeData.bike_number || '',
          bike_name: bikeData.bike_name || '',
          customer_name: bikeData.customer_name || '',
          mobile: bikeData.mobile || '',
        });
        showToastMsg('New bike registered successfully', 'success');
      }
      await fetchData();
    } catch (error: any) {
      console.error('Error saving bike:', error);
      showToastMsg(error.code === '23505' ? 'Bike number already exists' : 'Failed to save bike', 'error');
    }
    setShowForm(false);
    setEditingBike(null);
  };

  const handleEdit = (bike: Bike) => { setEditingBike(bike); setShowForm(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bike?')) return;
    try {
      await deleteBikeClient(id);
      showToastMsg('Bike deleted successfully', 'success');
      await fetchData();
    } catch (error) {
      console.error('Error deleting bike:', error);
      showToastMsg('Failed to delete bike', 'error');
    }
  };

  if (isLoading) return <LoadingWheel />;

  return (
    <div className="min-h-screen bg-app-bg">
      <Navigation onLogout={handleLogout} />
      <main className="page-section">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Vehicle Inventory</p>
            <h1 className="text-2xl font-bold text-slate-50 mt-0.5">Bike Management</h1>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Bike
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by number, model, or customer..."
            className="input-field pl-11"
          />
        </div>

        {/* Grid */}
        {filteredBikes.length === 0 ? (
          <div className="card py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-app-surface-hover flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-base font-semibold text-slate-50 mb-1">{searchTerm ? 'No results found' : 'No bikes yet'}</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">{searchTerm ? `No bikes match "${searchTerm}"` : 'Register your first bike to get started'}</p>
            {!searchTerm && <button onClick={() => setShowForm(true)} className="btn-primary text-xs">Add First Bike</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {showForm && <BikeForm bike={editingBike} onSave={handleSave} onClose={() => { setShowForm(false); setEditingBike(null); }} />}
        {showToast && <Toast message={toastMessage} type={toastType} />}
      </main>
    </div>
  );
}
