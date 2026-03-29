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
      showToastMessage('No data available for export', 'error');
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
    link.download = `CHAKRA_History_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToastMessage('CSV Exported Successfully', 'success');
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
    <div className="min-h-screen bg-chakra">
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="text-brand-accent font-display text-[10px] font-bold tracking-[0.4em] block mb-2 uppercase">Audit History</span>
            <h1 className="text-5xl font-display font-bold text-slate-900 dark:text-white leading-none uppercase">BILLING <span className="text-gradient">HISTORY</span></h1>
          </div>
          <button
            onClick={exportToCSV}
            className="btn-hover flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-display font-bold text-[11px] tracking-[0.2em] shadow-xl cursor-pointer hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all duration-500 uppercase"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'TOTAL INVOICES', value: stats.totalBills, color: 'text-slate-900 dark:text-white' },
            { label: 'GROSS REVENUE', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'text-emerald-600 dark:text-emerald-500' },
            { label: 'AVG TICKET', value: `₹${Math.round(stats.avgBill).toLocaleString()}`, color: 'text-brand-accent' },
            { label: 'JOBS COMPLETED', value: stats.services, color: 'text-blue-600 dark:text-blue-400' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 border border-slate-100 dark:border-white/5 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
              <p className={`text-3xl font-mono font-bold tracking-tighter ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 group">
          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-accent transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="FILTER BY BILL NUMBER, BIKE, OR CUSTOMER..."
              className="w-full pl-16 pr-8 py-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2rem] text-slate-900 dark:text-white font-display text-xs tracking-widest focus:ring-brand-accent/10 focus:ring-8 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
            />
          </div>
        </div>

        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Bill ID</th>
                  <th className="px-8 py-6 text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Vehicle Info</th>
                  <th className="px-8 py-6 text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Customer</th>
                  <th className="px-8 py-6 text-right text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Total Amount</th>
                  <th className="px-8 py-6 text-center text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5">
                          <svg className="w-8 h-8 text-slate-400 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="font-display text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">
                          {searchTerm ? 'No matching records' : 'History is empty'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <p className="font-mono font-bold text-brand-accent text-sm tracking-widest">{bill.bill_number}</p>
                        <p className="text-[9px] font-display font-bold text-slate-500 dark:text-slate-600 mt-1 uppercase">{formatDate(bill.created_at)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-display font-bold text-slate-800 dark:text-white text-[11px] tracking-tight mb-1 uppercase">{bill.bike_name || 'N/A'}</p>
                        <p className="font-mono text-[10px] text-slate-500 tracking-wider uppercase">{bill.bike_number || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-display font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1 uppercase">{bill.customer_name || 'N/A'}</p>
                        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-600 uppercase">+91 {bill.mobile || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-500 text-base">
                          ₹{(bill.total || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => viewBill(bill)}
                          className="bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white px-6 py-2.5 rounded-xl font-display font-bold text-[9px] tracking-widest transition-all duration-300 cursor-pointer uppercase"
                        >
                          View Details
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
            title="Service Record"
            size="lg"
          >
            <div className="space-y-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[1.5rem] border border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Bike Info</h4>
                  <p className="text-sm font-display font-bold text-slate-800 dark:text-white mb-1 uppercase">{selectedBill.bike_name || 'N/A'}</p>
                  <p className="font-mono font-bold text-brand-accent text-sm tracking-widest uppercase">{selectedBill.bike_number || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[1.5rem] border border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Customer</h4>
                  <p className="text-sm font-display font-bold text-slate-800 dark:text-white mb-1 uppercase">{selectedBill.customer_name || 'N/A'}</p>
                  <p className="font-mono font-bold text-slate-500 dark:text-slate-400 text-sm tracking-tight uppercase">+91 {selectedBill.mobile || 'N/A'}</p>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-white/5 rounded-[1.5rem] overflow-hidden relative z-10">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Service Details</th>
                      <th className="px-6 py-4 text-right text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    <tr>
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-display font-bold text-slate-700 dark:text-slate-300 uppercase">Service Protocol</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase leading-relaxed">{selectedBill.service_desc}</p>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-bold text-slate-900 dark:text-white text-base uppercase">₹{(selectedBill.service_amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    {(selectedBill.parts_amount || 0) > 0 && (
                      <tr>
                        <td className="px-6 py-5 text-[11px] font-display font-bold text-slate-700 dark:text-slate-300 uppercase">Hardware Replacement</td>
                        <td className="px-6 py-5 text-right font-mono font-bold text-slate-900 dark:text-white text-base uppercase">₹{(selectedBill.parts_amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {(selectedBill.gst_amount || 0) > 0 && (
                      <tr>
                        <td className="px-6 py-5 text-[11px] font-display font-bold text-slate-500 uppercase">GST Allocation ({selectedBill.gst_percent || 18}%)</td>
                        <td className="px-6 py-5 text-right font-mono font-bold text-slate-500 text-base uppercase">₹{(selectedBill.gst_amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {(selectedBill.discount || 0) > 0 && (
                      <tr>
                        <td className="px-6 py-5 text-[11px] font-display font-bold text-rose-600 dark:text-rose-500 uppercase">Applied Discount</td>
                        <td className="px-6 py-5 text-right font-mono font-bold text-rose-600 dark:text-rose-500 text-base uppercase">-₹{(selectedBill.discount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-900 dark:bg-brand-black text-white rounded-[1.5rem] p-8 relative z-10 shadow-2xl border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-xs font-display font-bold tracking-[0.4em] uppercase opacity-60">Net Total Paid</span>
                  <span className="text-4xl font-mono font-bold tracking-tighter uppercase text-brand-accent">
                    ₹{(selectedBill.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
                <button
                  onClick={handlePrint}
                  className="btn-hover flex-[1.5] bg-brand-accent text-white py-5 rounded-2xl font-display font-bold text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-neon transition-all uppercase"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print PDF
                </button>
                <div className="flex-1 flex gap-4">
                  <ShareButton bill={selectedBill} />
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-white/10 rounded-2xl font-display font-bold text-[10px] tracking-[0.2em] transition-all cursor-pointer uppercase"
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
