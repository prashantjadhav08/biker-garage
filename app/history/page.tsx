'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { Bill } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { generatePDF } from '@/lib/pdf';
import ShareButton from '@/components/ShareButton';

export default function HistoryPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchBills();
  }, [router]);

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  useEffect(() => {
    const filtered = bills.filter(
      (bill) =>
        bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.bike_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.mobile?.includes(searchTerm)
    );
    setFilteredBills(filtered);
  }, [searchTerm, bills]);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/bills?days=7');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBills(data);
        setFilteredBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      showToastMessage('Failed to fetch bills', 'error');
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

  const viewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const handlePrint = () => {
    if (selectedBill) {
      generatePDF(selectedBill);
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

  const stats = {
    totalBills: filteredBills.length,
    totalRevenue: filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0),
    avgBill: filteredBills.length > 0 ? filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0) / filteredBills.length : 0,
    services: filteredBills.length,
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
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-primary">Billing History</h1>
          <p className="text-slate-500 mt-1">View bills from the last 7 days</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-slate-500 text-sm">Total Bills</p>
            <p className="text-2xl font-bold text-primary font-mono">{stats.totalBills}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-slate-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600 font-mono">
              ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-slate-500 text-sm">Avg. Bill Value</p>
            <p className="text-2xl font-bold text-cta font-mono">
              ₹{stats.avgBill.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-slate-500 text-sm">Services Rendered</p>
            <p className="text-2xl font-bold text-accent font-mono">{stats.services}</p>
          </div>
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
              placeholder="Search by bill number, bike number, or customer..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Bill No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Bike Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Services</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      {searchTerm ? 'No bills match your search' : 'No bills in the last 7 days'}
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-cta">{bill.bill_number}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(bill.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{bill.bike_number || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{bill.customer_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{bill.service_desc}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-semibold text-green-600">
                          ₹{(bill.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => viewBill(bill)}
                          className="text-cta hover:text-red-700 font-medium text-sm cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedBill && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={`Bill ${selectedBill.bill_number}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-mono font-bold text-primary">CHAKRA</h2>
                <p className="text-sm text-slate-500">Professional Bike Service Center</p>
                <p className="text-xs text-slate-400 mt-1">Bill #{selectedBill.bill_number}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(selectedBill.created_at)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Customer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Bike:</span> <span className="font-mono">{selectedBill.bike_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Model:</span> {selectedBill.bike_name || 'N/A'}
                  </div>
                  <div>
                    <span className="text-slate-500">Name:</span> {selectedBill.customer_name || 'N/A'}
                  </div>
                  <div>
                    <span className="text-slate-500">Mobile:</span> {selectedBill.mobile || 'N/A'}
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
                      <td className="px-3 py-2">{selectedBill.service_desc}</td>
                      <td className="px-3 py-2 text-right">₹{(selectedBill.service_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {(selectedBill.parts_amount || 0) > 0 && (
                      <tr className="border-b">
                        <td className="px-3 py-2">Parts</td>
                        <td className="px-3 py-2 text-right">₹{(selectedBill.parts_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    {(selectedBill.gst_amount || 0) > 0 && (
                      <tr className="border-b">
                        <td className="px-3 py-2">GST ({selectedBill.gst_percent || 18}%)</td>
                        <td className="px-3 py-2 text-right">₹{(selectedBill.gst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    {(selectedBill.discount || 0) > 0 && (
                      <tr className="border-b text-red-600">
                        <td className="px-3 py-2">Discount</td>
                        <td className="px-3 py-2 text-right">-₹{(selectedBill.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-primary text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total Amount</span>
                  <span className="text-2xl font-mono font-bold">
                    ₹{(selectedBill.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
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
                <ShareButton bill={selectedBill} />
                <button
                  onClick={() => setShowModal(false)}
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
