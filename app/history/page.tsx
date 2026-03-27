'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBills } from '@/lib/services';
import { Bill } from '@/lib/types';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';
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
    if (localStorage.getItem('chakra_role') === 'staff') {
      router.push('/bikes');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const data = await getBills(7);
      setBills(data);
      setFilteredBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const exportToCSV = () => {
    if (filteredBills.length === 0) {
      showToastMessage('No data to export', 'error');
      return;
    }

    const headers = ['Bill No', 'Date', 'Bike Number', 'Bike Name', 'Customer', 'Mobile', 'Service Description', 'Service Amount', 'Parts Amount', 'GST', 'GST Amount', 'Discount', 'Total'];
    const rows = filteredBills.map(bill => [
      bill.bill_number,
      new Date(bill.created_at).toLocaleDateString('en-IN'),
      bill.bike_number,
      bill.bike_name,
      bill.customer_name,
      bill.mobile,
      bill.service_desc.replace(/,/g, ';'),
      bill.service_amount.toString(),
      bill.parts_amount.toString(),
      bill.gst_percent.toString(),
      bill.gst_amount.toString(),
      bill.discount.toString(),
      bill.total.toString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chakra_Bills_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToastMessage('CSV exported successfully!', 'success');
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
    return <LoadingWheel />;
  }

  return (
    <>
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold text-primary dark:text-white">Billing History</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Audit log of all transactions from the last 7 days</p>
          </div>
          <button
            onClick={exportToCSV}
            className="btn-hover flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Invoices</p>
            <p className="text-3xl font-mono font-bold text-primary dark:text-white">{stats.totalBills}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-500">
              ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Ticket Size</p>
            <p className="text-3xl font-mono font-bold text-cta">
              ₹{stats.avgBill.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jobs Completed</p>
            <p className="text-3xl font-mono font-bold text-accent">{stats.services}</p>
          </div>
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
              placeholder="Filter by bill number, bike or customer name..."
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-cta/5 outline-none transition-all"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill Info</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-slate-500 font-medium">
                          {searchTerm ? `No matches found for "${searchTerm}"` : 'No transactions found in this period'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-cta">{bill.bill_number}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{formatDate(bill.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary dark:text-white text-sm">{bill.bike_name || 'N/A'}</p>
                        <p className="font-mono text-[10px] text-slate-500 uppercase mt-0.5">{bill.bike_number || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary dark:text-white text-sm">{bill.customer_name || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">+91 {bill.mobile || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-500 text-base">
                          ₹{(bill.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => viewBill(bill)}
                          className="bg-primary/5 dark:bg-white/5 text-primary dark:text-white hover:bg-cta hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer"
                        >
                          DETAILS
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
            title={`Invoice ${selectedBill.bill_number}`}
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
                  <span>Bill No: {selectedBill.bill_number}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>Date: {formatDate(selectedBill.created_at)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vehicle Info</h4>
                  <p className="text-sm font-bold text-primary dark:text-white">{selectedBill.bike_name || 'N/A'}</p>
                  <p className="text-sm font-mono font-bold text-cta mt-0.5">{selectedBill.bike_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Info</h4>
                  <p className="text-sm font-bold text-primary dark:text-white">{selectedBill.customer_name || 'N/A'}</p>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">+91 {selectedBill.mobile || 'N/A'}</p>
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
                    <tr>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 dark:text-slate-300">Service Work</p>
                        <p className="text-xs text-slate-500 mt-0.5">{selectedBill.service_desc}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary dark:text-white">₹{(selectedBill.service_amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    {(selectedBill.parts_amount || 0) > 0 && (
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Spare Parts & Components</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-primary dark:text-white">₹{(selectedBill.parts_amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {(selectedBill.gst_amount || 0) > 0 && (
                      <tr>
                        <td className="px-4 py-3 font-medium text-slate-400">GST ({selectedBill.gst_percent || 18}%)</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-400">₹{(selectedBill.gst_amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {(selectedBill.discount || 0) > 0 && (
                      <tr>
                        <td className="px-4 py-3 font-medium text-rose-500">Promotional Discount</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-rose-500">-₹{(selectedBill.discount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-primary dark:bg-slate-950 text-white rounded-2xl p-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount Paid</span>
                  <span className="text-3xl font-mono font-bold">
                    ₹{(selectedBill.total || 0).toLocaleString('en-IN')}
                  </span>
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
                  Print PDF
                </button>
                <div className="flex-1 flex gap-3">
                  <ShareButton bill={selectedBill} />
                  <button
                    onClick={() => setShowModal(false)}
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
