'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getRemindersClient, sendWhatsAppReminderClient } from '@/lib/api/client';
import { Bill } from '@/lib/types';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';
import Toast from '@/components/Toast';

interface ReminderItem extends Bill {
  daysSince?: number;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [filtered, setFiltered] = useState<ReminderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const data = await getRemindersClient();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const enriched = data.map((bill) => {
        const created = new Date(bill.created_at);
        const diffDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
        return { ...bill, daysSince: diffDays };
      });
      setReminders(enriched);
      setFiltered(enriched);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      showToastMsg('Failed to fetch reminders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { clearAuthToken(); router.push('/login'); };

  useEffect(() => {
    const f = reminders.filter((r) =>
      r.bike_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bike_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mobile?.includes(searchTerm)
    );
    setFiltered(f);
  }, [searchTerm, reminders]);

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSend = async (billId: string) => {
    setSendingId(billId);
    try {
      const result = await sendWhatsAppReminderClient(billId);
      showToastMsg(result.success ? (result.message || 'Reminder sent!') : (result.error || 'Failed'), result.success ? 'success' : 'error');
    } catch (error: any) {
      showToastMsg('Failed to send reminder', 'error');
    } finally {
      setSendingId(null);
    }
  };

  const formatDate = (dateString: string) => { try { return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return 'N/A'; } };

  if (isLoading) return <LoadingWheel />;

  return (
    <div className="min-h-screen bg-app-bg">
      <Navigation onLogout={handleLogout} />
      <main className="page-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">WhatsApp</p>
            <h1 className="text-2xl font-bold text-slate-50 mt-0.5">Service Reminders</h1>
            <p className="text-sm text-slate-500 mt-1">Bikes due for service (3 months since last visit)</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <span className="text-xs text-amber-400 font-medium">SIMULATION MODE — No real messages sent</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by bike, customer, or mobile..." className="input-field pl-11" />
        </div>

        {/* Table or Empty */}
        {filtered.length === 0 ? (
          <div className="card py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-app-surface-hover flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-base font-semibold text-slate-50 mb-1">{searchTerm ? 'No results found' : 'No reminders due'}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">{searchTerm ? `No reminders match "${searchTerm}"` : 'All bikes are up to date. Reminders appear when a bike is due for service.'}</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-app-bg border-b border-app-border">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Last Service</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Days Since</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {filtered.map((reminder) => (
                    <tr key={reminder.id} className="hover:bg-app-surface-hover/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-200">{reminder.bike_name}</p>
                        <p className="font-mono text-xs text-brand-accent mt-0.5">{reminder.bike_number}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-300">{reminder.customer_name}</p>
                        <p className="font-mono text-xs text-slate-500 mt-0.5">+91 {reminder.mobile}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{formatDate(reminder.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">{reminder.daysSince} days</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button onClick={() => handleSend(reminder.id)} disabled={sendingId === reminder.id}
                          className="btn-primary py-1.5 px-4 text-xs disabled:opacity-50">
                          {sendingId === reminder.id ? (
                            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                          ) : (
                            <>Send Reminder</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showToast && <Toast message={toastMessage} type={toastType} />}
      </main>
    </div>
  );
}
