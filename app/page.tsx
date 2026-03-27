'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { getBikes, getBills } from '@/lib/services';
import { Bike, Bill } from '@/lib/types';
import Navigation from '@/components/Navigation';
import LoadingWheel from '@/components/LoadingWheel';

export default function DashboardPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
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
      const [bikesData, billsData] = await Promise.all([
        getBikes(),
        getBills(7),
      ]);

      setBikes(bikesData);
      setRecentBills(billsData.slice(0, 5));
      
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
          <div className="glass-card p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white uppercase">RECENT <span className="text-brand-accent">BIKES</span></h2>
              <Link href="/bikes" className="bg-slate-50 dark:bg-white/5 hover:bg-brand-accent hover:text-white px-4 py-2 rounded-lg text-[10px] font-display font-bold tracking-widest transition-all shadow-soft dark:shadow-none">
                VIEW ALL →
              </Link>
            </div>
            {bikes.length === 0 ? (
              <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                <p className="text-slate-400 dark:text-slate-500 font-display text-xs tracking-widest uppercase">No bikes registered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bikes.slice(0, 5).map((bike) => (
                  <div key={bike.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-brand-accent/20 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-black flex items-center justify-center font-mono font-bold text-brand-accent text-xs shadow-soft dark:shadow-none border border-slate-100 dark:border-transparent">
                        {bike.bike_number.slice(-2)}
                      </div>
                      <div>
                        <p className="font-mono font-bold text-slate-900 dark:text-white text-sm tracking-tight uppercase">{bike.bike_number}</p>
                        <p className="text-[10px] font-display font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5 uppercase">{bike.bike_name}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-display font-bold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase">{bike.customer_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white uppercase">RECENT <span className="text-brand-accent">BILLS</span></h2>
              <Link href="/history" className="bg-slate-50 dark:bg-white/5 hover:bg-brand-accent hover:text-white px-4 py-2 rounded-lg text-[10px] font-display font-bold tracking-widest transition-all shadow-soft dark:shadow-none">
                VIEW ALL →
              </Link>
            </div>
            {recentBills.length === 0 ? (
              <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                <p className="text-slate-400 dark:text-slate-500 font-display text-xs tracking-widest uppercase">No bills generated</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-brand-accent/20 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-transparent">
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-mono font-bold text-brand-accent text-sm tracking-tight uppercase">{bill.bill_number}</p>
                        <p className="text-[10px] font-display font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5 uppercase">{bill.bike_number}</p>
                      </div>
                    </div>
                    <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">₹{bill.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
