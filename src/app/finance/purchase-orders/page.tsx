'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AuthGuard } from '@/components/auth-guard';
import { PurchaseOrderItem, POStatus } from '@/lib/types';
import { formatINRPlain } from '@/lib/invoice-utils';
import { PurchaseOrderView } from '@/components/finance/purchase-order-view';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  Mail,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Eye,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Send,
  X,
} from 'lucide-react';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPOForPreview, setSelectedPOForPreview] = useState<PurchaseOrderItem | null>(null);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/purchase-orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPurchaseOrders(data);
          try {
            localStorage.setItem('codekap_cached_pos', JSON.stringify(data));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Failed to fetch POs, using cache:', err);
      try {
        const cached = localStorage.getItem('codekap_cached_pos');
        if (cached) setPurchaseOrders(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instant cache hydration
    try {
      const cached = localStorage.getItem('codekap_cached_pos');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPurchaseOrders(parsed);
          setLoading(false);
        }
      }
    } catch {}

    // 2. Fresh fetch
    fetchPOs();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this Purchase Order?')) return;
    try {
      const res = await fetch(`/api/finance/purchase-orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPurchaseOrders((prev) => {
          const updated = prev.filter((p) => p.id !== id && p.poNumber !== id);
          try {
            localStorage.setItem('codekap_cached_pos', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: POStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/finance/purchase-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.id === id || po.poNumber === id ? { ...po, status: newStatus } : po))
        );
        if (selectedPOForPreview && (selectedPOForPreview.id === id || selectedPOForPreview.poNumber === id)) {
          setSelectedPOForPreview((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const filtered = purchaseOrders.filter((po) => {
    const matchSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      (po.vendorGstin && po.vendorGstin.toLowerCase().includes(search.toLowerCase())) ||
      (po.projectRefNo && po.projectRefNo.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || po.status.toUpperCase() === statusFilter.toUpperCase();

    return matchSearch && matchStatus;
  });

  // KPI Calculations
  const totalSpend = purchaseOrders.reduce((acc, p) => acc + (Number(p.grandTotal) || 0), 0);
  const issuedOrdersCount = purchaseOrders.filter((p) => p.status === 'ISSUED').length;
  const approvedOrdersCount = purchaseOrders.filter((p) => p.status === 'APPROVED').length;
  const draftOrdersCount = purchaseOrders.filter((p) => p.status === 'DRAFT').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ISSUED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <Link href="/finance" className="hover:text-blue-600">Finance & Billing</Link>
                <span>/</span>
                <span className="text-slate-900">Purchase Orders</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <ShoppingBag className="w-6 h-6 text-[#004B35]" />
                <span>Purchase Orders (PO) Hub</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Procure goods & vendor services, generate GST purchase order documents, and deliver PDFs directly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchPOs}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Refresh PO List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                href="/finance/purchase-orders/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004B35] hover:bg-[#003828] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create Purchase Order</span>
              </Link>
            </div>
          </div>

          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Total Orders Value
              </span>
              <div className="text-2xl font-black text-slate-900">
                ₹{formatINRPlain(totalSpend)}
              </div>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                {purchaseOrders.length} Purchase Orders in CRM
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Issued to Vendors
              </span>
              <div className="text-2xl font-black text-blue-700">{issuedOrdersCount}</div>
              <p className="text-xs text-slate-500 mt-1">Awaiting vendor fulfillment</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Approved Orders
              </span>
              <div className="text-2xl font-black text-emerald-700">{approvedOrdersCount}</div>
              <p className="text-xs text-emerald-600 mt-1">Fulfillment cleared & verified</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Drafts
              </span>
              <div className="text-2xl font-black text-amber-600">{draftOrdersCount}</div>
              <p className="text-xs text-slate-500 mt-1">Work in progress POs</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PO #, Vendor, GSTIN..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['ALL', 'DRAFT', 'ISSUED', 'APPROVED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-[#004B35] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Vendor / Supplier</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Expected Delivery</th>
                    <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading && purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        Loading purchase orders...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        No purchase orders found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((po) => (
                      <tr
                        key={po.id}
                        onClick={() => setSelectedPOForPreview(po)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                          {po.poNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{po.vendorName}</div>
                          {po.vendorGstin && (
                            <div className="text-[10px] font-mono text-slate-500">
                              GSTIN: {po.vendorGstin}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{po.orderDate}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {po.expectedDeliveryDate || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-slate-950">
                          ₹{formatINRPlain(po.grandTotal)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                              po.status
                            )}`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedPOForPreview(po)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Preview & Print PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/finance/purchase-orders/edit/${po.id}`}
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit PO"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => handleDelete(po.id, e)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete PO"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Full Screen View Modal */}
        {selectedPOForPreview && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6 flex items-start justify-center">
            <div className="relative w-full max-w-5xl my-4">
              <PurchaseOrderView
                po={selectedPOForPreview}
                onClose={() => setSelectedPOForPreview(null)}
                onStatusChange={(newStatus) =>
                  handleStatusUpdate(selectedPOForPreview.id, newStatus)
                }
              />
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}

