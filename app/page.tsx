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
      setError('Failed to load data');
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

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Navigation onLogout={handleLogout} />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 mt-6">
          {error}
        </div>
      </main>
    );
  }

  return (
    <>
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-primary dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome to Chakra Management System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Bikes</p>
                <p className="text-3xl font-mono font-bold text-primary dark:text-white mt-1">{stats.totalBikes}</p>
              </div>
              <div className="bg-cta/10 p-3 rounded-lg ring-1 ring-cta/20">
                <svg className="w-6 h-6 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Bills (7 Days)</p>
                <p className="text-3xl font-mono font-bold text-primary dark:text-white mt-1">{stats.totalBills}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg ring-1 ring-green-500/20">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Revenue (7 Days)</p>
                <p className="text-3xl font-mono font-bold text-green-600 dark:text-green-500 mt-1">
                  ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg ring-1 ring-accent/20">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Bill Value</p>
                <p className="text-3xl font-mono font-bold text-cta mt-1">
                  ₹{stats.avgBill.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg ring-1 ring-purple-500/20">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary dark:text-white">Recent Bikes</h2>
              <Link href="/bikes" className="text-cta hover:text-red-700 dark:hover:text-red-500 text-sm font-medium cursor-pointer transition-colors">
                View All →
              </Link>
            </div>
            {bikes.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No bikes registered yet</p>
            ) : (
              <div className="space-y-3">
                {bikes.slice(0, 5).map((bike) => (
                  <div key={bike.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg">
                    <div>
                      <p className="font-mono font-semibold text-primary dark:text-slate-100">{bike.bike_number}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{bike.bike_name}</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{bike.customer_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary dark:text-white">Recent Bills</h2>
              <Link href="/history" className="text-cta hover:text-red-700 dark:hover:text-red-500 text-sm font-medium cursor-pointer transition-colors">
                View All →
              </Link>
            </div>
            {recentBills.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No bills generated yet</p>
            ) : (
              <div className="space-y-3">
                {recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg">
                    <div>
                      <p className="font-mono font-semibold text-cta">{bill.bill_number}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{bill.bike_number} - {bill.customer_name}</p>
                    </div>
                    <p className="font-mono font-semibold text-green-600 dark:text-green-500">₹{bill.total.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/bikes"
            className="card-hover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex items-center gap-4 cursor-pointer"
          >
            <div className="bg-cta/10 p-4 rounded-xl ring-1 ring-cta/20">
              <svg className="w-8 h-8 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-primary dark:text-white text-lg">Register Bike</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Add new customer bike</p>
            </div>
          </Link>

          <Link
            href="/billing"
            className="card-hover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex items-center gap-4 cursor-pointer"
          >
            <div className="bg-green-500/10 p-4 rounded-xl ring-1 ring-green-500/20">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-primary dark:text-white text-lg">Create Bill</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Generate new invoice</p>
            </div>
          </Link>

          <Link
            href="/history"
            className="card-hover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex items-center gap-4 cursor-pointer"
          >
            <div className="bg-accent/10 p-4 rounded-xl ring-1 ring-accent/20">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-primary dark:text-white text-lg">View History</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Last 7 days bills</p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
