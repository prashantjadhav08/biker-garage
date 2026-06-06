'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBikesClient, getBillsClient, getRemindersClient, sendWhatsAppReminderClient } from '@/lib/api/client';
import { Bike, Bill } from '@/lib/types';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';

export default function DashboardPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [reminders, setReminders] = useState<Bill[]>([]);
  const [stats, setStats] = useState({ totalBikes: 0, totalBills: 0, totalRevenue: 0, avgBill: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    if (localStorage.getItem('chakra_role') === 'staff') { router.push('/bikes'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [bikesData, billsData, remindersData] = await Promise.all([
        getBikesClient(),
        getBillsClient(7),
        getRemindersClient()
      ]);
      setBikes(bikesData);
      setRecentBills(billsData.slice(0, 5));
      setReminders(remindersData);
      const totalRevenue = billsData.reduce((sum: number, bill: Bill) => sum + (bill.total || 0), 0);
      setStats({
        totalBikes: bikesData.length,
        totalBills: billsData.length,
        totalRevenue,
        avgBill: billsData.length > 0 ? totalRevenue / billsData.length : 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { clearAuthToken(); router.push('/login'); };

  const sendWhatsAppReminder = async (bill: Bill) => {
    try {
      const result = await sendWhatsAppReminderClient(bill.id);
      alert(result.success ? (result.message || 'Reminder sent!') : (result.error || 'Failed'));
    } catch (e) { alert('Failed to send reminder'); }
  };

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }
    catch { return 'N/A'; }
  };

  if (isLoading) return <LoadingWheel />;

  return (
    <div className="min-h-screen bg-app-bg">
      <Navigation onLogout={handleLogout} />
      <main className="page-section">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Overview</p>
            <h1 className="text-2xl font-bold text-slate-50 mt-0.5">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            System Online
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Bikes" value={stats.totalBikes.toString()} icon="bike" color="text-brand-accent" />
          <StatCard label="Active Bills" value={stats.totalBills.toString()} icon="bill" color="text-brand-primary" />
          <StatCard label="Revenue" value={`₹${(stats.totalRevenue / 1000).toFixed(1)}k`} icon="money" color="text-green-400" />
          <StatCard label="Avg. Bill" value={`₹${Math.round(stats.avgBill).toLocaleString()}`} icon="chart" color="text-slate-400" />
        </div>

        {/* Recent bills + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent bills */}
          <div className="lg:col-span-2 card">
            <div className="px-5 py-4 border-b border-app-border flex items-center justify-between">
              <h2 className="font-semibold text-slate-50">Recent Bills</h2>
              <Link href="/history" className="text-xs text-brand-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-app-border">
              {recentBills.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">No bills yet</div>
              ) : (
                recentBills.map((bill) => (
                  <div key={bill.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-app-surface-hover/50 transition-colors">
                    <div>
                      <p className="text-sm font-mono font-medium text-slate-300">{bill.bill_number}</p>
                      <p className="text-xs text-slate-500">{bill.bike_name} · {bill.customer_name}</p>
                    </div>
                    <span className="text-sm font-mono font-medium text-green-400">₹{(bill.total || 0).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-50 text-sm mb-2">Quick Actions</h2>
            <ActionCard href="/bikes" label="Add Bike" desc="Register new vehicle" color="bg-brand-accent/10 text-brand-accent" />
            <ActionCard href="/billing" label="New Invoice" desc="Create service bill" color="bg-brand-primary/10 text-brand-primary" />
            <ActionCard href="/reminders" label="Reminders" desc="Send WhatsApp alerts" color="bg-amber-500/10 text-amber-400" />
          </div>
        </div>

        {/* Reminders */}
        {reminders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-50">Service Reminders</h2>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full">Due for service</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {reminders.slice(0, 5).map((bill) => (
                <div key={bill.id} className="card p-4 min-w-[260px] flex-shrink-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-mono font-medium text-brand-accent">{bill.bike_number}</p>
                      <p className="text-xs text-slate-500">{bill.bike_name}</p>
                    </div>
                    <span className="text-xs text-slate-600">{formatDate(bill.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{bill.customer_name}</p>
                  <button
                    onClick={() => sendWhatsAppReminder(bill)}
                    className="w-full btn-primary py-2 text-xs"
                  >
                    Send Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const icons: Record<string, JSX.Element> = {
    bike: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    bill: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>,
    money: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  };

  return (
    <div className="stat-card">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-app-surface-hover flex items-center justify-center ${color}`}>
          {icons[icon]}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-50">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ href, label, desc, color }: { href: string; label: string; desc: string; color: string }) {
  return (
    <Link href={href} className="card p-4 flex items-center gap-3 card-hover">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-200">{label}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </Link>
  );
}
