'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBikes, getBills, getReminders } from '@/lib/services';
import { Bike, Bill } from '@/lib/types';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';

export default function DashboardPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [reminders, setReminders] = useState<Bill[]>([]);
  const [stats, setStats] = useState({
    totalBikes: 0,
    totalBills: 0,
    totalRevenue: 0,
    avgBill: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const [bikesData, billsData, remindersData] = await Promise.all([
        getBikes(),
        getBills(7),
        getReminders()
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
      setError('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  const sendWhatsAppReminder = (bill: Bill) => {
    const message = `Hello ${bill.customer_name}, your ${bill.bike_name} (${bill.bike_number}) is due for its next periodic service at Biker Garage. It has been 3 months since your last visit on ${new Date(bill.created_at).toLocaleDateString()}. To maintain peak performance, we recommend a check-up. Book your appointment now!`;
    const url = `https://wa.me/91${bill.mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <LoadingWheel />;
  }

  return (
    <div className="min-h-screen bg-brand-offwhite dark:bg-brand-black transition-colors duration-500">
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-brand-accent font-display text-[10px] font-bold tracking-[0.4em] block mb-2 uppercase opacity-60">Welcome Back</span>
            <h1 className="text-5xl font-display font-bold text-slate-900 dark:text-white leading-none uppercase">CHAKRA <span className="text-gradient">DASHBOARD</span></h1>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/5 px-6 py-3 rounded-2xl shadow-soft dark:shadow-none">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-display font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">Live Status</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'TOTAL BIKES', value: stats.totalBikes, icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', color: 'brand-accent' },
            { label: 'WEEKLY BILLS', value: stats.totalBills, icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', color: 'emerald-500' },
            { label: 'TOTAL REVENUE', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald-400' },
            { label: 'AVG BILL VALUE', value: `₹${Math.round(stats.avgBill).toLocaleString()}`, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'brand-accent' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-8 group overflow-hidden relative bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 group-hover:bg-brand-accent/10 transition-colors duration-500"></div>
              <div className="flex flex-col relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-soft dark:shadow-none`}>
                  <svg className={`w-6 h-6 text-${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
                <p className="text-[10px] font-display font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-1 uppercase">{stat.label}</p>
                <p className="text-3xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* ... (bikes and bills sections) */}
        </div>

        {/* Service Reminders Section */}
        {reminders.length > 0 && (
          <div className="mb-12 fade-up">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight">SERVICE <span className="text-brand-accent">REMINDERS</span></h2>
              <span className="bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-lg text-[10px] font-display font-bold tracking-widest uppercase">
                3 MONTHS SINCE LAST VISIT
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reminders.map((bill) => (
                <div key={bill.id} className="glass-card p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-brand-accent/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-widest mb-1">{bill.bike_number}</p>
                      <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm uppercase">{bill.bike_name}</h4>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-12 0 9 9 0 0112 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6 relative z-10">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <span className="text-xs font-display font-bold uppercase tracking-tight">{bill.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-widest">LAST: {new Date(bill.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => sendWhatsAppReminder(bill)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-display font-bold text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 uppercase shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 relative z-10"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Send WhatsApp Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { href: '/bikes', label: 'REGISTER BIKE', desc: 'Add new vehicle', icon: 'M12 4v16m8-8H4', color: 'brand-accent' },
            { href: '/billing', label: 'CREATE BILL', desc: 'Generate invoice', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', color: 'emerald-500' },
            { href: '/history', label: 'VIEW HISTORY', desc: 'Audit transactions', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'blue-400' }
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="glass-card p-8 flex items-center gap-6 group kinetic-hover bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5"
            >
              <div className={`w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-accent/20 group-hover:shadow-neon transition-all duration-500 shadow-soft dark:shadow-none`}>
                <svg className={`w-8 h-8 text-brand-accent group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-brand-accent transition-colors uppercase">{action.label}</h3>
                <p className="text-[10px] font-display font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-1 uppercase">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
