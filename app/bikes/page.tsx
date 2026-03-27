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
        showToastMessage('Bike updated successfully', 'success');
      } else {
        await createBike({
          bike_number: bikeData.bike_number || '',
          bike_name: bikeData.bike_name || '',
          customer_name: bikeData.customer_name || '',
          mobile: bikeData.mobile || '',
        });
        showToastMessage('New bike registered successfully', 'success');
      }
      await fetchData();
    } catch (error: any) {
      console.error('Error saving bike:', error);
      if (error.code === '23505') {
        showToastMessage('Bike number already exists', 'error');
      } else {
        showToastMessage('Failed to save bike', 'error');
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
      showToastMessage('Bike deleted successfully', 'success');
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
    <div className="min-h-screen bg-celero">
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="text-brand-accent font-display text-[10px] font-bold tracking-[0.4em] block mb-2 uppercase">Vehicle Inventory</span>
            <h1 className="text-5xl font-display font-bold text-white leading-none uppercase">BIKE <span className="text-gradient">MANAGEMENT</span></h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-hover bg-brand-accent text-white px-8 py-4 rounded-2xl font-display font-bold text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 cursor-pointer shadow-neon uppercase"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
            ADD NEW BIKE
          </button>
        </div>

        <div className="mb-12 relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-accent transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH BY NUMBER, MODEL, OR CUSTOMER..."
            className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/5 rounded-[2rem] text-white font-display text-xs tracking-widest focus:ring-brand-accent/10 focus:ring-8 outline-none transition-all placeholder:text-slate-700"
          />
        </div>

        {filteredBikes.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-accent/5 blur-[100px]"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10 group">
                <svg className="w-12 h-12 text-slate-700 group-hover:text-brand-accent transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-4 tracking-tighter uppercase">
                {searchTerm ? 'No results found' : 'No bikes found'}
              </h3>
              <p className="text-slate-500 font-display text-[10px] tracking-[0.2em] max-w-xs mx-auto uppercase">
                {searchTerm 
                  ? `FILTER PATTERN "${searchTerm}" RETURNED NO RESULTS` 
                  : 'REGISTER YOUR FIRST VEHICLE TO GET STARTED'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-10 text-brand-accent hover:text-white font-display text-[10px] font-bold tracking-[0.3em] flex items-center gap-3 mx-auto transition-all cursor-pointer group uppercase"
                >
                  <span className="w-8 h-px bg-brand-accent group-hover:w-12 transition-all"></span>
                  REGISTER FIRST BIKE
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </div>
  );
}
