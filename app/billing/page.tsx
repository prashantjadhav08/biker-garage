'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBikes, createBill } from '@/lib/services';
import { Bike, Bill } from '@/lib/types';
import { bikeParts, serviceTypes } from '@/lib/parts';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { generatePDF } from '@/lib/pdf';
import ShareButton from '@/components/ShareButton';

export default function BillingPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const [formData, setFormData] = useState({
    bike_id: '',
    service_desc: '',
    service_amount: '',
    parts_amount: '',
    gst_percent: '18',
    discount: '',
  });

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    gst_amount: 0,
    total: 0,
  });

  const [selectedParts, setSelectedParts] = useState<{ name: string; price: number }[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ name: string; price: number }[]>([]);
  const [manualNotes, setManualNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'parts'>('services');

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
    } catch (error) {
      console.error('Error fetching bikes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  useEffect(() => {
    const service = Math.max(0, parseFloat(formData.service_amount) || 0);
    const parts = Math.max(0, parseFloat(formData.parts_amount) || 0);
    const gst = parseFloat(formData.gst_percent) || 0;
    const discount = Math.max(0, parseFloat(formData.discount) || 0);

    const subtotal = service + parts;
    const gst_amount = subtotal * (gst / 100);
    const total = Math.max(0, subtotal + gst_amount - discount);

    setCalculations({ subtotal, gst_amount, total });
  }, [formData.service_amount, formData.parts_amount, formData.gst_percent, formData.discount]);

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBikeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bikeId = e.target.value;
    const bike = bikes.find((b) => b.id === bikeId);
    setSelectedBike(bike || null);
    setFormData((prev) => ({ ...prev, bike_id: bikeId }));
    setErrors((prev) => ({ ...prev, bike_id: '' }));
  };

  const updateServiceDesc = (parts: { name: string; price: number }[], services: { name: string; price: number }[]) => {
    const partsDesc = parts.map(p => p.name).join(', ');
    const servicesDesc = services.map(s => s.name).join(', ');
    const allItems = [servicesDesc, partsDesc].filter(Boolean).join(' | ');
    
    let combined = '';
    if (allItems) {
      combined = allItems;
      if (manualNotes) {
        combined += `\n\nNotes: ${manualNotes}`;
      }
    } else if (manualNotes) {
      combined = manualNotes;
    }
    
    setFormData((prev) => ({ ...prev, service_desc: combined }));
  };

  const addPart = (part: { name: string; price: number }) => {
    const currentPartsAmt = parseFloat(formData.parts_amount) || 0;
    const newParts = [...selectedParts, part];
    setFormData((prev) => ({ ...prev, parts_amount: String(currentPartsAmt + part.price) }));
    setSelectedParts(newParts);
    updateServiceDesc(newParts, selectedServices);
  };

  const removePart = (index: number) => {
    const removedPart = selectedParts[index];
    const currentPartsAmt = parseFloat(formData.parts_amount) || 0;
    const newParts = selectedParts.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, parts_amount: String(Math.max(0, currentPartsAmt - removedPart.price)) }));
    setSelectedParts(newParts);
    updateServiceDesc(newParts, selectedServices);
  };

  const addService = (service: { name: string; price: number }) => {
    const currentServiceAmt = parseFloat(formData.service_amount) || 0;
    const newServices = [...selectedServices, service];
    setFormData((prev) => ({ ...prev, service_amount: String(currentServiceAmt + service.price) }));
    setSelectedServices(newServices);
    updateServiceDesc(selectedParts, newServices);
  };

  const removeService = (index: number) => {
    const removedService = selectedServices[index];
    const currentServiceAmt = parseFloat(formData.service_amount) || 0;
    const newServices = selectedServices.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, service_amount: String(Math.max(0, currentServiceAmt - removedService.price)) }));
    setSelectedServices(newServices);
    updateServiceDesc(selectedParts, newServices);
  };

  const getSelectedItemsDesc = () => {
    return formData.service_desc.trim() || 'Service';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (['service_amount', 'parts_amount', 'discount'].includes(name)) {
      if (value && parseFloat(value) < 0) return;
    }

    if (name === 'service_desc') {
      setManualNotes(value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bike_id) {
      newErrors.bike_id = 'Bike selection required';
    }

    if (!formData.service_desc.trim()) {
      newErrors.service_desc = 'Service description required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newBill = await createBill({
        bike_id: selectedBike?.id || '',
        bike_number: selectedBike?.bike_number || '',
        bike_name: selectedBike?.bike_name || '',
        customer_name: selectedBike?.customer_name || '',
        mobile: selectedBike?.mobile || '',
        service_desc: getSelectedItemsDesc(),
        service_items: selectedServices,
        parts_items: selectedParts,
        service_amount: parseFloat(formData.service_amount) || 0,
        parts_amount: parseFloat(formData.parts_amount) || 0,
        gst_percent: parseFloat(formData.gst_percent),
        discount: parseFloat(formData.discount) || 0,
      });

      setCurrentBill(newBill);
      setShowBill(true);
      showToastMessage('Invoice created successfully', 'success');

      setFormData({
        bike_id: '',
        service_desc: '',
        service_amount: '',
        parts_amount: '',
        gst_percent: '18',
        discount: '',
      });
      setSelectedBike(null);
      setSelectedParts([]);
      setSelectedServices([]);
      setManualNotes('');
    } catch (error: any) {
      console.error('Error creating bill:', error);
      showToastMessage('Failed to create invoice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (currentBill) {
      generatePDF(currentBill);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return <LoadingWheel />;
  }

  return (
    <div className="min-h-screen bg-celero">
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 fade-up">
        <div className="mb-12">
          <span className="text-brand-accent font-display text-[10px] font-bold tracking-[0.4em] block mb-2 uppercase">Billing System</span>
          <h1 className="text-5xl font-display font-bold text-white leading-none uppercase">CREATE <span className="text-gradient">INVOICE</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Bike Selection */}
          <div className="space-y-8">
            <div className="glass-panel rounded-[2.5rem] p-8 md:p-10">
              <h3 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-4 uppercase">
                <div className="bg-brand-accent/10 p-3 rounded-2xl">
                  <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                Bike & Customer
              </h3>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] mb-3 ml-2 group-focus-within:text-brand-accent transition-colors uppercase">
                    Select Bike
                  </label>
                  <select
                    name="bike_id"
                    value={formData.bike_id}
                    onChange={handleBikeSelect}
                    className={`w-full p-5 bg-white/5 border rounded-[1.5rem] cursor-pointer focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all font-mono text-sm tracking-tight ${
                      errors.bike_id ? 'border-rose-500' : 'border-white/5'
                    }`}
                  >
                    <option value="" className="bg-brand-black">-- SELECT A BIKE --</option>
                    {bikes.map((bike) => (
                      <option key={bike.id} value={bike.id} className="bg-brand-black">
                        {bike.bike_number} — {bike.bike_name}
                      </option>
                    ))}
                  </select>
                  {errors.bike_id && <p className="text-rose-500 text-[10px] font-display font-bold tracking-widest mt-3 ml-2 uppercase">{errors.bike_id}</p>}
                </div>

                {selectedBike && (
                  <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 fade-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                      <div>
                        <span className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] block mb-2 uppercase">Bike Number</span>
                        <p className="font-mono font-bold text-brand-accent text-lg">{selectedBike.bike_number}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] block mb-2 uppercase">Bike Model</span>
                        <p className="font-display font-bold text-white text-sm tracking-tight uppercase">{selectedBike.bike_name}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] block mb-2 uppercase">Customer</span>
                        <p className="font-display font-bold text-white text-sm tracking-tight uppercase">{selectedBike.customer_name}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] block mb-2 uppercase">Mobile</span>
                        <p className="font-display font-bold text-white text-sm tracking-tight">+91 {selectedBike.mobile}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Section */}
            <div className="glass-panel rounded-[2.5rem] overflow-hidden">
              <div className="flex bg-white/5 p-1">
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex-1 py-4 text-[10px] font-display font-bold tracking-[0.3em] transition-all rounded-2xl uppercase ${
                    activeTab === 'services' 
                      ? 'bg-brand-accent text-white shadow-neon' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('parts')}
                  className={`flex-1 py-4 text-[10px] font-display font-bold tracking-[0.3em] transition-all rounded-2xl uppercase ${
                    activeTab === 'parts' 
                      ? 'bg-brand-accent text-white shadow-neon' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Spare Parts
                </button>
              </div>
              
              <div className="p-8 max-h-[450px] overflow-y-auto custom-scrollbar">
                {activeTab === 'services' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {serviceTypes.map((service, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addService(service)}
                        className="p-5 text-left bg-white/5 border border-white/5 rounded-2xl hover:border-brand-accent/30 hover:bg-brand-accent/5 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-accent/5 rounded-full -mr-8 -mt-8"></div>
                        <p className="text-[11px] font-display font-bold text-slate-300 group-hover:text-brand-accent tracking-tighter mb-2 uppercase">{service.name}</p>
                        <p className="text-sm font-mono font-bold text-white">₹{service.price}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bikeParts.map((part, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPart(part)}
                        className="p-5 text-left bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full -mr-8 -mt-8"></div>
                        <p className="text-[11px] font-display font-bold text-slate-300 group-hover:text-emerald-500 tracking-tighter mb-2 uppercase">{part.name}</p>
                        <p className="text-sm font-mono font-bold text-white">₹{part.price}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Billing Details */}
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
            
            <h3 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-4 relative z-10 uppercase">
              <div className="bg-emerald-500/10 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              Billing Summary
            </h3>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* Selected Items List */}
              {(selectedServices.length > 0 || selectedParts.length > 0) && (
                <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 space-y-4">
                  <h4 className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.4em] px-2 mb-4 uppercase">Selected Items</h4>
                  <div className="space-y-3">
                    {selectedServices.map((s, idx) => (
                      <div key={`s-${idx}`} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 fade-up">
                        <span className="text-[11px] font-display font-bold text-slate-300 tracking-tight uppercase">{s.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono font-bold text-brand-accent">₹{s.price}</span>
                          <button type="button" onClick={() => removeService(idx)} className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors bg-white/5 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedParts.map((p, idx) => (
                      <div key={`p-${idx}`} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 fade-up">
                        <span className="text-[11px] font-display font-bold text-slate-300 tracking-tight uppercase">{p.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono font-bold text-emerald-500">₹{p.price}</span>
                          <button type="button" onClick={() => removePart(idx)} className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors bg-white/5 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] mb-3 ml-2 group-focus-within:text-brand-accent transition-colors uppercase">
                  Service Description & Notes
                </label>
                <textarea
                  name="service_desc"
                  value={formData.service_desc}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter details of service work..."
                  className={`w-full p-5 bg-white/5 border rounded-2xl focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all resize-none text-white font-mono text-sm ${
                    errors.service_desc ? 'border-rose-500' : 'border-white/5'
                  }`}
                />
                {errors.service_desc && <p className="text-rose-500 text-[10px] font-display font-bold tracking-widest mt-3 ml-2 uppercase">{errors.service_desc}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] mb-3 ml-2 uppercase">
                    Service Total (₹)
                  </label>
                  <input
                    type="number"
                    name="service_amount"
                    value={formData.service_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all font-mono text-white"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] mb-3 ml-2 uppercase">
                    Parts Total (₹)
                  </label>
                  <input
                    type="number"
                    name="parts_amount"
                    value={formData.parts_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] mb-3 ml-2 uppercase">
                    GST Rate (%)
                  </label>
                  <select
                    name="gst_percent"
                    value={formData.gst_percent}
                    onChange={handleChange}
                    className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl focus:ring-8 focus:ring-brand-accent/5 outline-none cursor-pointer transition-all text-white font-mono"
                  >
                    <option value="0" className="bg-brand-black">0% — No Tax</option>
                    <option value="5" className="bg-brand-black">5% — GST</option>
                    <option value="12" className="bg-brand-black">12% — GST</option>
                    <option value="18" className="bg-brand-black">18% — GST</option>
                    <option value="28" className="bg-brand-black">28% — GST</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-[10px] font-display font-bold text-slate-500 tracking-[0.2em] mb-3 ml-2 uppercase">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl focus:ring-8 focus:ring-brand-accent/5 outline-none transition-all font-mono text-rose-500"
                  />
                </div>
              </div>

              {/* Total Card */}
              <div className="bg-brand-accent text-white rounded-[2.5rem] p-10 shadow-neon-strong relative overflow-hidden kinetic-hover group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-125"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16"></div>
                
                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-display font-bold tracking-[0.2em] opacity-80 uppercase">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{calculations.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-display font-bold tracking-[0.2em] opacity-80 uppercase">
                    <span>GST ({formData.gst_percent}%)</span>
                    <span className="font-mono">₹{calculations.gst_amount.toLocaleString('en-IN')}</span>
                  </div>
                  {parseFloat(formData.discount) > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-display font-bold tracking-[0.2em] text-black uppercase">
                      <span>Discount</span>
                      <span className="font-mono">-₹{parseFloat(formData.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pt-8 border-t border-white/20 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-display font-bold text-white/60 uppercase tracking-[0.4em] block mb-2 uppercase">Final Amount</span>
                      <span className="text-5xl font-mono font-bold tracking-tighter">
                        ₹{Math.round(calculations.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-white text-brand-accent px-4 py-2 rounded-xl text-[10px] font-display font-bold tracking-widest shadow-xl uppercase">
                      Ready
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-brand-black py-6 rounded-[2rem] font-display font-bold tracking-[0.2em] text-sm shadow-2xl kinetic-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 transition-all uppercase"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-brand-accent" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Generate Bill</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Modal Invoice Result */}
        {showBill && currentBill && (
          <Modal
            isOpen={showBill}
            onClose={() => setShowBill(false)}
            title={`Invoice ${currentBill.bill_number}`}
            size="lg"
          >
            <div className="space-y-8 bg-brand-black p-4 rounded-3xl border border-white/5">
              <div className="text-center pb-10 border-b border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-accent/10 blur-[60px] rounded-full"></div>
                <div className="relative z-10">
                  <div className="bg-brand-accent w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-neon">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tighter uppercase">CHAKRA</h2>
                  <p className="text-[10px] font-display font-bold text-brand-accent tracking-[0.5em] mt-2 uppercase">Service Bill</p>
                  <div className="flex items-center justify-center gap-6 mt-8 text-[9px] font-display font-bold text-slate-500 uppercase tracking-widest">
                    <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Bill No: {currentBill.bill_number}</span>
                    <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Date: {formatDate(currentBill.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                  <h4 className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 uppercase">Bike Info</h4>
                  <p className="text-xs font-display font-bold text-white mb-1 uppercase uppercase">{currentBill.bike_name}</p>
                  <p className="font-mono font-bold text-brand-accent tracking-widest text-sm uppercase">{currentBill.bike_number}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                  <h4 className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 uppercase">Customer</h4>
                  <p className="text-xs font-display font-bold text-white mb-1 uppercase uppercase">{currentBill.customer_name}</p>
                  <p className="font-mono font-bold text-slate-400 text-sm uppercase">+91 {currentBill.mobile}</p>
                </div>
              </div>

              <div className="border border-white/5 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] uppercase">Description</th>
                      <th className="px-6 py-4 text-right text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentBill.service_items?.map((item, idx) => (
                      <tr key={`s-${idx}`}>
                        <td className="px-6 py-4 text-[11px] font-display font-bold text-slate-300 uppercase">Service: {item.name}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white text-sm">₹{item.price}</td>
                      </tr>
                    ))}
                    {currentBill.parts_items?.map((item, idx) => (
                      <tr key={`p-${idx}`}>
                        <td className="px-6 py-4 text-[11px] font-display font-bold text-slate-300 uppercase">Part: {item.name}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white text-sm">₹{item.price}</td>
                      </tr>
                    ))}
                    {(!currentBill.service_items || currentBill.service_items.length === 0) && currentBill.service_amount > 0 && (
                      <tr>
                        <td className="px-6 py-4 text-[11px] font-display font-bold text-slate-300 uppercase">Service Charges</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white text-sm">₹{currentBill.service_amount}</td>
                      </tr>
                    )}
                    {(!currentBill.parts_items || currentBill.parts_items.length === 0) && currentBill.parts_amount > 0 && (
                      <tr>
                        <td className="px-6 py-4 text-[11px] font-display font-bold text-slate-300 uppercase">Spare Parts</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white text-sm">₹{currentBill.parts_amount}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white text-brand-black rounded-[2rem] p-8 shadow-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] uppercase">
                    <span>Tax & Discounts</span>
                    <span className="font-mono uppercase">
                      GST({currentBill.gst_percent}%) : ₹{currentBill.gst_amount.toFixed(0)} | Disc: ₹{currentBill.discount.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-brand-black/5">
                    <span className="text-xs font-display font-bold tracking-[0.3em] uppercase">Net Total</span>
                    <span className="text-4xl font-mono font-bold tracking-tighter">₹{currentBill.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
                <button
                  onClick={handlePrint}
                  className="btn-hover flex-1 bg-white/5 text-white py-5 rounded-[1.5rem] font-display font-bold text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 border border-white/5 transition-all uppercase"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Invoice
                </button>
                <div className="flex-1 flex gap-4">
                  <ShareButton bill={currentBill} />
                  <button
                    onClick={() => setShowBill(false)}
                    className="flex-1 py-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-[1.5rem] font-display font-bold text-[10px] tracking-[0.2em] transition-all uppercase"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {showToast && <Toast message={toastMessage} type={toastType} />}
      </main>
    </div>
  );
}
