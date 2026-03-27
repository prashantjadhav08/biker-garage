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
      newErrors.bike_id = 'Please select a bike';
    }

    if (!formData.service_desc.trim()) {
      newErrors.service_desc = 'Please enter service description';
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
      showToastMessage('Bill created successfully!', 'success');

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
      showToastMessage(error.message || 'Failed to create bill', 'error');
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
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return <LoadingWheel />;
  }

  return (
    <>
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-primary dark:text-white">Generate Invoice</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create a new professional bill for bike services</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Bike Selection */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-bold text-primary dark:text-white mb-6 flex items-center gap-3">
                <div className="bg-cta/10 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                Customer & Vehicle
              </h3>

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1 group-focus-within:text-cta transition-colors">
                    Select Registered Bike
                  </label>
                  <select
                    name="bike_id"
                    value={formData.bike_id}
                    onChange={handleBikeSelect}
                    className={`w-full p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl cursor-pointer focus:ring-4 focus:ring-cta/10 outline-none transition-all ${
                      errors.bike_id ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <option value="">-- Choose a vehicle --</option>
                    {bikes.map((bike) => (
                      <option key={bike.id} value={bike.id}>
                        {bike.bike_number} — {bike.bike_name}
                      </option>
                    ))}
                  </select>
                  {errors.bike_id && <p className="text-rose-500 text-xs mt-2 ml-1 font-medium">{errors.bike_id}</p>}
                </div>

                {selectedBike && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 fade-in">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Bike Number</span>
                        <p className="font-mono font-bold text-primary dark:text-white">{selectedBike.bike_number}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Vehicle Model</span>
                        <p className="font-bold text-primary dark:text-white">{selectedBike.bike_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Customer Name</span>
                        <p className="font-bold text-primary dark:text-white">{selectedBike.customer_name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contact Number</span>
                        <p className="font-bold text-primary dark:text-white">+91 {selectedBike.mobile}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex-1 py-4 text-sm font-bold tracking-tight transition-all ${
                    activeTab === 'services' 
                      ? 'bg-cta/5 text-cta border-b-2 border-cta' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  SERVICE TYPES
                </button>
                <button
                  onClick={() => setActiveTab('parts')}
                  className={`flex-1 py-4 text-sm font-bold tracking-tight transition-all ${
                    activeTab === 'parts' 
                      ? 'bg-cta/5 text-cta border-b-2 border-cta' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  SPARE PARTS
                </button>
              </div>
              
              <div className="p-6 md:p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                {activeTab === 'services' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceTypes.map((service, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addService(service)}
                        className="p-3 text-left border border-slate-100 dark:border-slate-800 rounded-xl hover:border-cta/30 hover:bg-cta/5 transition-all group"
                      >
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-cta">{service.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">₹{service.price}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bikeParts.map((part, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPart(part)}
                        className="p-3 text-left border border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                      >
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600">{part.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">₹{part.price}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bill Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-primary dark:text-white mb-6 flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              Billing Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Items Summary */}
              {(selectedServices.length > 0 || selectedParts.length > 0) && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Selected Items</h4>
                  <div className="space-y-2">
                    {selectedServices.map((s, idx) => (
                      <div key={`s-${idx}`} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 fade-in">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-4">{s.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-cta">₹{s.price}</span>
                          <button type="button" onClick={() => removeService(idx)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedParts.map((p, idx) => (
                      <div key={`p-${idx}`} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 fade-in">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-4">{p.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-emerald-600">₹{p.price}</span>
                          <button type="button" onClick={() => removePart(idx)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1 group-focus-within:text-cta transition-colors">
                  Service Description & Notes
                </label>
                <textarea
                  name="service_desc"
                  value={formData.service_desc}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Details of work performed..."
                  className={`w-full p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl focus:ring-4 focus:ring-cta/10 outline-none transition-all resize-none ${
                    errors.service_desc ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {errors.service_desc && <p className="text-rose-500 text-xs mt-2 ml-1 font-medium">{errors.service_desc}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">
                    Service Total (₹)
                  </label>
                  <input
                    type="number"
                    name="service_amount"
                    value={formData.service_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-cta/10 outline-none transition-all font-mono"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">
                    Parts Total (₹)
                  </label>
                  <input
                    type="number"
                    name="parts_amount"
                    value={formData.parts_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-cta/10 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">
                    GST Rate (%)
                  </label>
                  <select
                    name="gst_percent"
                    value={formData.gst_percent}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-cta/10 outline-none cursor-pointer transition-all"
                  >
                    <option value="0">0% (No Tax)</option>
                    <option value="5">5% (GST)</option>
                    <option value="12">12% (GST)</option>
                    <option value="18">18% (GST)</option>
                    <option value="28">28% (GST)</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-cta/10 outline-none transition-all font-mono text-rose-600"
                  />
                </div>
              </div>

              {/* Total Summary Card */}
              <div className="bg-primary dark:bg-slate-950 text-white rounded-[2rem] p-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-mono">₹{calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-400">GST ({formData.gst_percent}%)</span>
                    <span className="font-mono">₹{calculations.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {parseFloat(formData.discount) > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-rose-400">
                      <span>Total Discount</span>
                      <span className="font-mono">-₹{parseFloat(formData.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Final Invoice Amount</span>
                      <span className="text-4xl font-mono font-bold tracking-tighter">
                        ₹{calculations.total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded-md mb-1.5">
                      Ready
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cta text-white py-5 rounded-2xl font-bold shadow-xl shadow-cta/20 hover:shadow-cta/30 btn-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Bill...
                  </>
                ) : (
                  <>
                    <span>Generate Final Bill</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bill Result Modal */}
        {showBill && currentBill && (
          <Modal
            isOpen={showBill}
            onClose={() => setShowBill(false)}
            title={`Invoice ${currentBill.bill_number}`}
            size="lg"
          >
            <div className="space-y-6">
              <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-cta w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cta/20">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-mono font-bold text-primary dark:text-white tracking-tighter">CHAKRA</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Professional Bike Service</p>
                <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Bill No: {currentBill.bill_number}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>Date: {formatDate(currentBill.created_at)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vehicle Info</h4>
                  <p className="text-sm font-bold text-primary dark:text-white">{currentBill.bike_name}</p>
                  <p className="text-sm font-mono font-bold text-cta mt-0.5">{currentBill.bike_number}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Info</h4>
                  <p className="text-sm font-bold text-primary dark:text-white">{currentBill.customer_name}</p>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">+91 {currentBill.mobile}</p>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Description</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentBill.service_items?.map((item, idx) => (
                      <tr key={`s-${idx}`}>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Service: {item.name}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-primary dark:text-white">₹{item.price}</td>
                      </tr>
                    ))}
                    {currentBill.parts_items?.map((item, idx) => (
                      <tr key={`p-${idx}`}>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Part: {item.name}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-primary dark:text-white">₹{item.price}</td>
                      </tr>
                    ))}
                    {/* Handle manual amounts if items don't exist */}
                    {(!currentBill.service_items || currentBill.service_items.length === 0) && currentBill.service_amount > 0 && (
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Service Charges</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-primary dark:text-white">₹{currentBill.service_amount}</td>
                      </tr>
                    )}
                    {(!currentBill.parts_items || currentBill.parts_items.length === 0) && currentBill.parts_amount > 0 && (
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Spare Parts</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-primary dark:text-white">₹{currentBill.parts_amount}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-primary dark:bg-slate-950 text-white rounded-2xl p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Tax & Discounts</span>
                    <span className="font-mono">
                      GST({currentBill.gst_percent}%) : ₹{currentBill.gst_amount.toFixed(0)} | Disc: ₹{currentBill.discount.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-lg font-bold">Total Paid</span>
                    <span className="text-3xl font-mono font-bold">₹{currentBill.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="btn-hover flex-1 bg-primary dark:bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Invoice
                </button>
                <div className="flex-1 flex gap-3">
                  <ShareButton bill={currentBill} />
                  <button
                    onClick={() => setShowBill(false)}
                    className="flex-1 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
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
    </>
  );
}
