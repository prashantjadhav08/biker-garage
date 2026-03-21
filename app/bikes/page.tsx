'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { Bike } from '@/lib/types';
import Navigation from '@/components/Navigation';
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
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchBikes();
  }, [router]);

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  useEffect(() => {
    const filtered = bikes.filter(
      (bike) =>
        bike.bike_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.bike_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.mobile?.includes(searchTerm)
    );
    setFilteredBikes(filtered);
  }, [searchTerm, bikes]);

  const fetchBikes = async () => {
    try {
      const res = await fetch('/api/bikes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBikes(data);
        setFilteredBikes(data);
      } else {
        console.warn('API returned non-array:', data);
      }
    } catch (error) {
      console.error('Error fetching bikes:', error);
      showToastMessage('Failed to fetch bikes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async (bikeData: Partial<Bike>) => {
    try {
      const url = editingBike ? '/api/bikes' : '/api/bikes';
      const method = editingBike ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBike ? { ...bikeData, id: editingBike.id } : bikeData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save bike');
      }

      setShowForm(false);
      setEditingBike(null);
      fetchBikes();
      showToastMessage(editingBike ? 'Bike updated successfully!' : 'Bike added successfully!', 'success');
    } catch (error: any) {
      console.error('Save error:', error);
      showToastMessage(error.message || 'Failed to save bike', 'error');
    }
  };

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bike?')) return;

    try {
      const res = await fetch(`/api/bikes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete bike');
      showToastMessage('Bike deleted successfully!', 'success');
      fetchBikes();
    } catch {
      showToastMessage('Failed to delete bike', 'error');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBike(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold text-primary">Bike Management</h1>
            <p className="text-slate-500 mt-1">Manage registered bikes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-hover bg-cta text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Bike
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bike number, name, or customer..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {filteredBikes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-slate-500 text-lg">
              {searchTerm ? 'No bikes match your search' : 'No bikes registered yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-cta hover:text-red-700 font-medium cursor-pointer"
              >
                Add your first bike
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {showForm && (
          <BikeForm
            bike={editingBike}
            onSave={handleSave}
            onClose={handleCloseForm}
          />
        )}

        {showToast && <Toast message={toastMessage} type={toastType} />}
      </main>
    </>
  );
}
