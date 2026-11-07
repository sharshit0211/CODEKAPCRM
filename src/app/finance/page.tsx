'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { DollarSign, Receipt, TrendingUp, AlertCircle, ArrowUpRight, Plus, FileText, Wallet, PieChart, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function FinanceOverviewPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    collected: 0,
    outstanding: 0,
    expenses: 0,
    surplus: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinanceData() {
      try {
        const res = await fetch('/api/dashboard/overview', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStats({
            revenue: data.revenue || 0,
            collected: data.collections || 0,
            outstanding: data.outstanding || 0,
            expenses: data.expenses || 0,
            surplus: data.operatingSurplus || 0,
          });
        }
      } catch (err) {
        console.warn('Failed to load finance data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinanceData();
  }, []);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span>Finance & Billing Hub</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Revenue collections, outstanding receivables, GST invoices, quotations & operating cash flow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/finance/purchase-orders"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Purchase Orders</span>
            </Link>
            <Link
              href="/finance/quotations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span>Quotations</span>
            </Link>
            <Link
              href="/finance/invoices"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Link>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Billed Revenue</span>
            <div className="text-2xl font-extrabold text-slate-900">{formatINR(stats.revenue)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">✓ Across all projects</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Collected (Cash In)</span>
            <div className="text-2xl font-extrabold text-emerald-700">{formatINR(stats.collected)}</div>
            <p className="text-xs text-slate-500 mt-1">Realized into Bank</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Receivables Due</span>
            <div className="text-2xl font-extrabold text-amber-600">{formatINR(stats.outstanding)}</div>
            <p className="text-xs text-amber-600 mt-1">Pending payment clearances</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Operating Expenses</span>
            <div className="text-2xl font-extrabold text-rose-600">{formatINR(stats.expenses)}</div>
            <p className="text-xs text-slate-500 mt-1">Surplus: {formatINR(stats.surplus)}</p>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/finance/purchase-orders"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-2xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Purchase Orders (PO)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Issue branded procurement POs, manage vendor contracts, itemized GST delivery schedules and PDF generation.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-4 flex items-center gap-1">
              Procurement Hub →
            </span>
          </Link>

          <Link
            href="/finance/invoices"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">GST Invoices & Razorpay</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate GST-compliant tax invoices with CGST/SGST/IGST breakdown and one-click Razorpay payment links.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">
              Manage Invoices →
            </span>
          </Link>

          <Link
            href="/finance/quotations"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 shadow-2xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Quotations & Proposals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build professional commercial estimates and quotations with automatic 1-click conversion to invoices.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 mt-4 flex items-center gap-1">
              View Quotations →
            </span>
          </Link>

          <Link
            href="/finance/reports"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-2xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">GST & Tax Reports</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                GSTR-1 and GSTR-3B ready sales register, taxable values, output tax summaries and monthly tax exports.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 mt-4 flex items-center gap-1">
              Tax Reports →
            </span>
          </Link>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
