'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBikes, createBike, updateBike, deleteBike } from '@/lib/services';
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
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const data = await getBikes();
      setBikes(data);
      setFilteredBikes(data);
    } catch (error) {
      console.error('Error fetching bikes:', error);
      showToastMessage('Failed to fetch bikes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async (bikeData: Partial<Bike>) => {
    try {
      if (editingBike) {
        await updateBike(editingBike.id, bikeData);
        showToastMessage('Bike updated successfully!', 'success');
      } else {
        await createBike({
          bike_number: bikeData.bike_number || '',
          bike_name: bikeData.bike_name || '',
          customer_name: bikeData.customer_name || '',
          mobile: bikeData.mobile || '',
        });
        showToastMessage('Bike added successfully!', 'success');
      }
      await fetchData();
    } catch (error: any) {
      console.error('Error saving bike:', error);
      if (error.code === '23505') {
        showToastMessage('Bike number already exists!', 'error');
      } else {
        showToastMessage(error.message || 'Failed to save bike', 'error');
      }
    }
    setShowForm(false);
    setEditingBike(null);
  };

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bike?')) return;
    try {
      await deleteBike(id);
      showToastMessage('Bike deleted successfully!', 'success');
      await fetchData();
    } catch (error) {
      console.error('Error deleting bike:', error);
      showToastMessage('Failed to delete bike', 'error');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBike(null);
  };

  if (isLoading) {
    return <LoadingWheel />;
  }

  return (
    <>
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold text-primary dark:text-white">Bike Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track customer vehicles</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-hover bg-cta text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cta/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Register New Bike
          </button>
        </div>

        <div className="mb-8 group">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cta transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bike number, name, or customer..."
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-cta/5 outline-none transition-all"
            />
          </div>
        </div>

        {filteredBikes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm fade-in">
            <div className="bg-slate-50 dark:bg-slate-950 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary dark:text-white mb-2">
              {searchTerm ? 'No results found' : 'No bikes registered'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {searchTerm 
                ? `We couldn't find any bikes matching "${searchTerm}"` 
                : 'Get started by adding your first customer vehicle to the system.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-8 text-cta hover:text-red-700 dark:hover:text-red-500 font-bold flex items-center gap-2 mx-auto transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Register First Bike
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
