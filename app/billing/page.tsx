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

  const getPartsTotal = () => selectedParts.reduce((sum, p) => sum + p.price, 0);
  const getServicesTotal = () => selectedServices.reduce((sum, s) => sum + s.price, 0);

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
          <h1 className="text-3xl font-mono font-bold text-primary">Create Bill</h1>
          <p className="text-slate-500 mt-1">Generate new invoice for bike service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Select Bike
            </h3>

            <select
              name="bike_id"
              value={formData.bike_id}
              onChange={handleBikeSelect}
              className={`w-full p-3 border rounded-lg mb-4 cursor-pointer ${
                errors.bike_id ? 'border-red-500' : 'border-slate-200'
              }`}
            >
              <option value="">-- Select a Bike --</option>
              {bikes.map((bike) => (
                <option key={bike.id} value={bike.id}>
                  {bike.bike_name} - {bike.bike_number}
                </option>
              ))}
            </select>
            {errors.bike_id && <p className="text-red-500 text-sm mb-4">{errors.bike_id}</p>}

            {selectedBike && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Selected Bike Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Bike Number</span>
                    <p className="font-semibold text-primary font-mono">{selectedBike.bike_number}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Bike Name</span>
                    <p className="font-semibold text-primary">{selectedBike.bike_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Customer</span>
                    <p className="font-semibold text-primary">{selectedBike.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Mobile</span>
                    <p className="font-semibold text-primary">{selectedBike.mobile}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              Bill Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Selection - Services */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quick Add Services
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {serviceTypes.map((service, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addService(service)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      + {service.name} (₹{service.price})
                    </button>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedServices.map((s, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full flex items-center gap-1">
                        {s.name} (₹{s.price})
                        <button type="button" onClick={() => removeService(idx)} className="ml-1 hover:text-red-200">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Selection - Parts */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quick Add Parts
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {bikeParts.slice(0, 15).map((part, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addPart(part)}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                    >
                      + {part.name} (₹{part.price})
                    </button>
                  ))}
                </div>
                {selectedParts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedParts.map((p, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-green-600 text-white rounded-full flex items-center gap-1">
                        {p.name} (₹{p.price})
                        <button type="button" onClick={() => removePart(idx)} className="ml-1 hover:text-red-200">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Service Description
                </label>
                <textarea
                  name="service_desc"
                  value={formData.service_desc}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Service Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="service_amount"
                    value={formData.service_amount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parts Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="parts_amount"
                    value={formData.parts_amount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    GST (%)
                  </label>
                  <select
                    name="gst_percent"
                    value={formData.gst_percent}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    <option value="0">No GST</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-primary text-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="font-mono">₹{calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300">GST ({formData.gst_percent}%)</span>
                  <span className="font-mono">₹{calculations.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {parseFloat(formData.discount) > 0 && (
                  <div className="flex justify-between items-center mb-2 text-red-400">
                    <span>Discount</span>
                    <span className="font-mono">-₹{parseFloat(formData.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                  <span className="text-lg">Total Amount</span>
                  <span className="text-3xl font-mono font-bold">₹{calculations.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-hover w-full bg-cta text-white py-3 rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generating Bill...' : 'Generate Bill'}
              </button>
            </form>
          </div>
        </div>

        {showBill && currentBill && (
          <Modal
            isOpen={showBill}
            onClose={() => setShowBill(false)}
            title={`Bill ${currentBill.bill_number}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-mono font-bold text-primary">CHAKRA</h2>
                <p className="text-sm text-slate-500">Professional Bike Service Center</p>
                <p className="text-xs text-slate-400 mt-1">Bill #{currentBill.bill_number}</p>
                <p className="text-xs text-slate-400">{formatDate(currentBill.created_at)}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Customer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Bike:</span> <span className="font-mono">{currentBill.bike_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Model:</span> {currentBill.bike_name}
                  </div>
                  <div>
                    <span className="text-slate-500">Name:</span> {currentBill.customer_name}
                  </div>
                  <div>
                    <span className="text-slate-500">Mobile:</span> {currentBill.mobile}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-600">Description</th>
                      <th className="px-3 py-2 text-right text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-3 py-2">{currentBill.service_desc}</td>
                      <td className="px-3 py-2 text-right">₹{currentBill.service_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {currentBill.parts_amount > 0 && (
                      <tr className="border-b">
                        <td className="px-3 py-2">Parts</td>
                        <td className="px-3 py-2 text-right">₹{currentBill.parts_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    {currentBill.gst_amount > 0 && (
                      <tr className="border-b">
                        <td className="px-3 py-2">GST ({currentBill.gst_percent}%)</td>
                        <td className="px-3 py-2 text-right">₹{currentBill.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    {currentBill.discount > 0 && (
                      <tr className="border-b text-red-600">
                        <td className="px-3 py-2">Discount</td>
                        <td className="px-3 py-2 text-right">-₹{currentBill.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-primary text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total Amount</span>
                  <span className="text-2xl font-mono font-bold">₹{currentBill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="btn-hover flex-1 bg-primary text-white py-3 rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print PDF
                </button>
                <ShareButton bill={currentBill} />
                <button
                  onClick={() => setShowBill(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showToast && <Toast message={toastMessage} type={toastType} />}
      </main>
    </>
  );
}
