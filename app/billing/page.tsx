'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBikesClient, createBillClient } from '@/lib/api/client';
import { Bike, Bill } from '@/lib/types';
import { bikeParts, serviceTypes } from '@/lib/utils/constants';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { generatePDF } from '@/lib/utils/pdf';

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

  const [calculations, setCalculations] = useState({ subtotal: 0, gst_amount: 0, total: 0 });
  const [selectedParts, setSelectedParts] = useState<{ name: string; price: number }[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ name: string; price: number }[]>([]);
  const [manualNotes, setManualNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'parts'>('services');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {       const data = await getBikesClient();
      setBikes(data); }
    catch (error) { console.error('Error fetching bikes:', error); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => { clearAuthToken(); router.push('/login'); };

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

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBikeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bike = bikes.find((b) => b.id === e.target.value);
    setSelectedBike(bike || null);
    setFormData((prev) => ({ ...prev, bike_id: e.target.value }));
    setErrors((prev) => ({ ...prev, bike_id: '' }));
  };

  const updateServiceDesc = (parts: typeof selectedParts, services: typeof selectedServices) => {
    const partsDesc = parts.map(p => p.name).join(', ');
    const servicesDesc = services.map(s => s.name).join(', ');
    const allItems = [servicesDesc, partsDesc].filter(Boolean).join(' | ');
    let combined = allItems || '';
    if (manualNotes) combined += (combined ? ' | ' : '') + manualNotes;
    setFormData((prev) => ({ ...prev, service_desc: combined }));
  };

  const addPart = (part: { name: string; price: number }) => {
    const newParts = [...selectedParts, part];
    setFormData((prev) => ({ ...prev, parts_amount: String((parseFloat(prev.parts_amount) || 0) + part.price) }));
    setSelectedParts(newParts);
    updateServiceDesc(newParts, selectedServices);
  };

  const removePart = (index: number) => {
    const removed = selectedParts[index];
    const newParts = selectedParts.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, parts_amount: String(Math.max(0, (parseFloat(prev.parts_amount) || 0) - removed.price)) }));
    setSelectedParts(newParts);
    updateServiceDesc(newParts, selectedServices);
  };

  const addService = (service: { name: string; price: number }) => {
    const newServices = [...selectedServices, service];
    setFormData((prev) => ({ ...prev, service_amount: String((parseFloat(prev.service_amount) || 0) + service.price) }));
    setSelectedServices(newServices);
    updateServiceDesc(selectedParts, newServices);
  };

  const removeService = (index: number) => {
    const removed = selectedServices[index];
    const newServices = selectedServices.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, service_amount: String(Math.max(0, (parseFloat(prev.service_amount) || 0) - removed.price)) }));
    setSelectedServices(newServices);
    updateServiceDesc(selectedParts, newServices);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.bike_id) newErrors.bike_id = 'Select a bike';
    if (!formData.service_desc.trim()) newErrors.service_desc = 'Service description required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const newBill = await createBillClient({
        bike_id: selectedBike?.id || '',
        bike_number: selectedBike?.bike_number || '',
        bike_name: selectedBike?.bike_name || '',
        customer_name: selectedBike?.customer_name || '',
        mobile: selectedBike?.mobile || '',
        service_desc: formData.service_desc,
        service_items: selectedServices,
        parts_items: selectedParts,
        service_amount: parseFloat(formData.service_amount) || 0,
        parts_amount: parseFloat(formData.parts_amount) || 0,
        gst_percent: parseFloat(formData.gst_percent),
        discount: parseFloat(formData.discount) || 0,
      });
      setCurrentBill(newBill);
      setShowBill(true);
      showToastMsg('Invoice created successfully', 'success');
      setFormData({ bike_id: '', service_desc: '', service_amount: '', parts_amount: '', gst_percent: '18', discount: '' });
      setSelectedBike(null);
      setSelectedParts([]);
      setSelectedServices([]);
      setManualNotes('');
    } catch (error: any) {
      console.error('Error creating bill:', error);
      showToastMsg('Failed to create invoice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => { if (currentBill) generatePDF(currentBill); };
  const formatDate = (dateString: string) => { try { return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return 'N/A'; } };

  if (isLoading) return <LoadingWheel />;

  return (
    <div className="min-h-screen bg-app-bg">
      <Navigation onLogout={handleLogout} />
      <main className="page-section">
        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Billing System</p>
          <h1 className="text-2xl font-bold text-slate-50 mt-0.5">Create Invoice</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Bike Selection */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-50 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Bike & Customer
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label mb-1.5 block">Select Bike</label>
                  <select name="bike_id" value={formData.bike_id} onChange={handleBikeSelect}
                    className={`input-field cursor-pointer ${errors.bike_id ? 'border-red-500' : ''}`}>
                    <option value="" className="bg-app-bg">Select a bike</option>
                    {bikes.map((bike) => (
                      <option key={bike.id} value={bike.id} className="bg-app-bg">{bike.bike_number} — {bike.bike_name}</option>
                    ))}
                  </select>
                  {errors.bike_id && <p className="text-red-400 text-xs mt-1">{errors.bike_id}</p>}
                </div>
                {selectedBike && (
                  <div className="bg-app-bg rounded-lg p-3 border border-app-border">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-slate-500 text-xs">Bike Number</span><p className="font-mono font-semibold text-brand-accent">{selectedBike.bike_number}</p></div>
                      <div><span className="text-slate-500 text-xs">Model</span><p className="text-slate-200">{selectedBike.bike_name}</p></div>
                      <div><span className="text-slate-500 text-xs">Customer</span><p className="text-slate-200">{selectedBike.customer_name}</p></div>
                      <div><span className="text-slate-500 text-xs">Mobile</span><p className="font-mono text-slate-200">+91 {selectedBike.mobile}</p></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Catalog */}
            <div className="card overflow-hidden">
              <div className="flex bg-app-bg p-1 border-b border-app-border">
                <button onClick={() => setActiveTab('services')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'services' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}>Services</button>
                <button onClick={() => setActiveTab('parts')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'parts' ? 'bg-brand-accent text-white' : 'text-slate-400 hover:text-slate-200'}`}>Spare Parts</button>
              </div>
              <div className="p-3 max-h-[360px] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(activeTab === 'services' ? serviceTypes : bikeParts).map((item, idx) => (
                    <button key={idx} type="button" onClick={() => activeTab === 'services' ? addService(item) : addPart(item)}
                      className="p-3 text-left bg-app-bg border border-app-border rounded-lg hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all cursor-pointer">
                      <p className="text-xs font-medium text-slate-300">{item.name}</p>
                      <p className="text-sm font-mono font-semibold text-slate-50 mt-0.5">₹{item.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Billing Summary */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-50 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
              Billing Summary
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selected items */}
              {(selectedServices.length > 0 || selectedParts.length > 0) && (
                <div className="bg-app-bg rounded-lg p-4 border border-app-border space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Selected Items</p>
                  {[...selectedServices.map((s, i) => ({ ...s, type: 'service', idx: i })), ...selectedParts.map((p, i) => ({ ...p, type: 'part', idx: i }))].map((item) => (
                    <div key={`${item.type}-${item.idx}`} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">₹{item.price}</span>
                        <button type="button" onClick={() => item.type === 'service' ? removeService(item.idx) : removePart(item.idx)}
                          className="p-1 text-slate-600 hover:text-red-400 cursor-pointer transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="label mb-1.5 block">Service Description & Notes</label>
                <textarea name="service_desc" value={formData.service_desc} onChange={(e) => { setManualNotes(e.target.value); setFormData(p => ({ ...p, service_desc: e.target.value })); }}
                  rows={3} placeholder="Enter details..." className={`input-field resize-none ${errors.service_desc ? 'border-red-500' : ''}`} />
                {errors.service_desc && <p className="text-red-400 text-xs mt-1">{errors.service_desc}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="label mb-1.5 block">Service Total (₹)</label><input type="number" name="service_amount" value={formData.service_amount} onChange={(e) => setFormData(p => ({ ...p, service_amount: e.target.value }))} placeholder="0.00" className="input-field" /></div>
                <div><label className="label mb-1.5 block">Parts Total (₹)</label><input type="number" name="parts_amount" value={formData.parts_amount} onChange={(e) => setFormData(p => ({ ...p, parts_amount: e.target.value }))} placeholder="0.00" className="input-field" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="label mb-1.5 block">GST Rate (%)</label>
                  <select name="gst_percent" value={formData.gst_percent} onChange={(e) => setFormData(p => ({ ...p, gst_percent: e.target.value }))} className="input-field cursor-pointer">
                    <option value="0" className="bg-app-bg">0%</option>
                    <option value="5" className="bg-app-bg">5%</option>
                    <option value="12" className="bg-app-bg">12%</option>
                    <option value="18" className="bg-app-bg">18%</option>
                    <option value="28" className="bg-app-bg">28%</option>
                  </select>
                </div>
                <div><label className="label mb-1.5 block">Discount (₹)</label><input type="number" name="discount" value={formData.discount} onChange={(e) => setFormData(p => ({ ...p, discount: e.target.value }))} placeholder="0.00" className="input-field" /></div>
              </div>

              {/* Total */}
              <div className="bg-brand-primary rounded-xl p-5 text-white">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-white/70">Subtotal</span><span className="font-mono">₹{calculations.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-white/70">GST ({formData.gst_percent}%)</span><span className="font-mono">₹{calculations.gst_amount.toLocaleString()}</span></div>
                  {parseFloat(formData.discount) > 0 && <div className="flex justify-between"><span className="text-white/70">Discount</span><span className="font-mono">-₹{parseFloat(formData.discount).toLocaleString()}</span></div>}
                  <div className="pt-2 border-t border-white/20 flex justify-between items-end">
                    <span className="text-xs text-white/60">Final Amount</span>
                    <span className="text-2xl font-bold font-mono">₹{Math.round(calculations.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3 disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Generate Bill'}
              </button>
            </form>
          </div>
        </div>

        {/* Bill Modal */}
        {showBill && currentBill && (
          <Modal isOpen={showBill} onClose={() => setShowBill(false)} title="Service Invoice" size="lg">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-app-bg rounded-lg p-4 border border-app-border">
                  <p className="text-xs text-slate-500 mb-1">Bike</p>
                  <p className="text-sm font-medium text-slate-200">{currentBill.bike_name}</p>
                  <p className="font-mono text-brand-accent text-sm">{currentBill.bike_number}</p>
                </div>
                <div className="bg-app-bg rounded-lg p-4 border border-app-border">
                  <p className="text-xs text-slate-500 mb-1">Customer</p>
                  <p className="text-sm font-medium text-slate-200">{currentBill.customer_name}</p>
                  <p className="font-mono text-slate-400 text-sm">+91 {currentBill.mobile}</p>
                </div>
              </div>

              <div className="border border-app-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-app-bg border-b border-app-border"><tr><th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Description</th><th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">Amount</th></tr></thead>
                  <tbody className="divide-y divide-app-border">
                    {currentBill.service_items?.map((item, idx) => (<tr key={idx}><td className="px-4 py-2.5 text-slate-300">Service: {item.name}</td><td className="px-4 py-2.5 text-right font-mono text-slate-200">₹{item.price}</td></tr>))}
                    {currentBill.parts_items?.map((item, idx) => (<tr key={idx}><td className="px-4 py-2.5 text-slate-300">Part: {item.name}</td><td className="px-4 py-2.5 text-right font-mono text-slate-200">₹{item.price}</td></tr>))}
                    {(!currentBill.service_items?.length && currentBill.service_amount > 0) && (<tr><td className="px-4 py-2.5 text-slate-300">Service Charges</td><td className="px-4 py-2.5 text-right font-mono text-slate-200">₹{currentBill.service_amount}</td></tr>)}
                    {(!currentBill.parts_items?.length && currentBill.parts_amount > 0) && (<tr><td className="px-4 py-2.5 text-slate-300">Spare Parts</td><td className="px-4 py-2.5 text-right font-mono text-slate-200">₹{currentBill.parts_amount}</td></tr>)}
                  </tbody>
                </table>
              </div>

              <div className="bg-app-surface-hover rounded-xl p-5 border border-app-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Net Total</span>
                  <span className="text-3xl font-bold font-mono text-brand-primary">₹{currentBill.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button onClick={handlePrint} className="btn-primary py-3 text-xs">Print Invoice</button>
                <button onClick={() => setShowBill(false)} className="btn-secondary py-3 text-xs">Close</button>
              </div>
            </div>
          </Modal>
        )}

        {showToast && <Toast message={toastMessage} type={toastType} />}
      </main>
    </div>
  );
}
