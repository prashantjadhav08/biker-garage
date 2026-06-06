'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBillsClient } from '@/lib/api/client';
import { Bill } from '@/lib/types';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';
import Modal from '@/components/Modal';
import { generatePDF } from '@/lib/utils/pdf';

export default function HistoryPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (localStorage.getItem('chakra_role') === 'staff') { router.push('/bikes'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {       const data = await getBillsClient(); setBills(data); setFilteredBills(data); }
    catch (error) { console.error('Error fetching bills:', error); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => { clearAuthToken(); router.push('/login'); };

  useEffect(() => {
    const f = bills.filter((b) =>
      b.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bike_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobile?.includes(searchTerm)
    );
    setFilteredBills(f);
  }, [searchTerm, bills]);

  const exportToCSV = () => {
    if (!filteredBills.length) return;
    const headers = ['Bill No', 'Date', 'Bike Number', 'Bike Name', 'Customer', 'Mobile', 'Description', 'Service', 'Parts', 'GST', 'GST Amt', 'Discount', 'Total'];
    const rows = filteredBills.map(b => [b.bill_number, new Date(b.created_at).toLocaleDateString('en-IN'), b.bike_number, b.bike_name, b.customer_name, b.mobile, b.service_desc.replace(/,/g, ';'), b.service_amount, b.parts_amount, b.gst_percent, b.gst_amount, b.discount, b.total]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CHAKRA_History_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const viewBill = (bill: Bill) => { setSelectedBill(bill); setShowModal(true); };
  const handlePrint = () => { if (selectedBill) generatePDF(selectedBill); };
  const formatDate = (dateString: string) => { try { return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return 'N/A'; } };

  const stats = {
    totalBills: filteredBills.length,
    totalRevenue: filteredBills.reduce((sum, b) => sum + (b.total || 0), 0),
    avgBill: filteredBills.length > 0 ? filteredBills.reduce((sum, b) => sum + (b.total || 0), 0) / filteredBills.length : 0,
  };

  if (isLoading) return <LoadingWheel />;

  return (
    <div className="min-h-screen bg-app-bg">
      <Navigation onLogout={handleLogout} />
      <main className="page-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Audit History</p>
            <h1 className="text-2xl font-bold text-slate-50 mt-0.5">Billing History</h1>
          </div>
          <button onClick={exportToCSV} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatBox label="Total Invoices" value={stats.totalBills} />
          <StatBox label="Gross Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="text-green-400" />
          <StatBox label="Avg Ticket" value={`₹${Math.round(stats.avgBill).toLocaleString()}`} color="text-brand-accent" />
          <StatBox label="Jobs Done" value={stats.totalBills} color="text-slate-400" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter by bill number, bike, or customer..." className="input-field pl-11" />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-app-bg border-b border-app-border">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Bill ID</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredBills.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center">
                    <div className="w-10 h-10 rounded-lg bg-app-surface-hover flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-xs text-slate-500">{searchTerm ? 'No matching records' : 'History is empty'}</p>
                  </td></tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-app-surface-hover/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-mono font-semibold text-brand-accent text-sm">{bill.bill_number}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{formatDate(bill.created_at)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-200">{bill.bike_name || 'N/A'}</p>
                        <p className="font-mono text-xs text-slate-500">{bill.bike_number || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-300">{bill.customer_name || 'N/A'}</p>
                        <p className="font-mono text-xs text-slate-500">+91 {bill.mobile || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-mono font-semibold text-green-400">₹{(bill.total || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button onClick={() => viewBill(bill)} className="btn-secondary py-1.5 px-3 text-xs">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Detail Modal */}
        {selectedBill && (
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Service Record" size="lg">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-app-bg rounded-lg p-4 border border-app-border">
                  <p className="text-xs text-slate-500 mb-1">Bike Info</p>
                  <p className="text-sm font-medium text-slate-200">{selectedBill.bike_name || 'N/A'}</p>
                  <p className="font-mono text-brand-accent text-sm">{selectedBill.bike_number || 'N/A'}</p>
                </div>
                <div className="bg-app-bg rounded-lg p-4 border border-app-border">
                  <p className="text-xs text-slate-500 mb-1">Customer</p>
                  <p className="text-sm font-medium text-slate-200">{selectedBill.customer_name || 'N/A'}</p>
                  <p className="font-mono text-slate-400 text-sm">+91 {selectedBill.mobile || 'N/A'}</p>
                </div>
              </div>

              <div className="border border-app-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-app-bg border-b border-app-border"><tr><th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Details</th><th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">Amount</th></tr></thead>
                  <tbody className="divide-y divide-app-border">
                    <tr><td className="px-4 py-3 text-slate-300">Service Protocol</td><td className="px-4 py-3 text-right font-mono font-medium text-slate-200">₹{(selectedBill.service_amount || 0).toLocaleString()}</td></tr>
                    {(selectedBill.parts_amount || 0) > 0 && <tr><td className="px-4 py-3 text-slate-300">Parts</td><td className="px-4 py-3 text-right font-mono font-medium text-slate-200">₹{(selectedBill.parts_amount || 0).toLocaleString()}</td></tr>}
                    {(selectedBill.gst_amount || 0) > 0 && <tr><td className="px-4 py-3 text-slate-500">GST ({selectedBill.gst_percent || 18}%)</td><td className="px-4 py-3 text-right font-mono text-slate-400">₹{(selectedBill.gst_amount || 0).toLocaleString()}</td></tr>}
                    {(selectedBill.discount || 0) > 0 && <tr><td className="px-4 py-3 text-red-400">Discount</td><td className="px-4 py-3 text-right font-mono text-red-400">-₹{(selectedBill.discount || 0).toLocaleString()}</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="bg-app-surface-hover rounded-xl p-5 border border-app-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Net Total Paid</span>
                  <span className="text-3xl font-bold font-mono text-brand-primary">₹{(selectedBill.total || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={handlePrint} className="btn-primary py-3 text-xs">Print PDF</button>
                <button onClick={() => setShowModal(false)} className="btn-secondary py-3 text-xs">Close</button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, color = 'text-slate-50' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
