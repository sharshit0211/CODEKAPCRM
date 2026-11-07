'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AuthGuard } from '@/components/auth-guard';
import { PurchaseOrderEditor } from '@/components/finance/purchase-order-editor';
import { PurchaseOrderItem } from '@/lib/types';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [po, setPo] = useState<PurchaseOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/finance/purchase-orders/${id}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Purchase Order not found');
        return res.json();
      })
      .then((data) => {
        setPo(data);
      })
      .catch((err) => {
        try {
          const cached = localStorage.getItem('codekap_cached_pos');
          if (cached) {
            const list = JSON.parse(cached);
            const found = list.find((p: any) => p.id === id || p.poNumber === id);
            if (found) {
              setPo(found);
              return;
            }
          }
        } catch (_) {}
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="min-h-[400px] flex items-center justify-center p-6 text-slate-500 text-xs font-semibold gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading Purchase Order details...</span>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (error || !po) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h2 className="text-base font-extrabold text-slate-900">Purchase Order Not Found</h2>
            <p className="text-xs text-slate-500 max-w-sm">
              The requested purchase order could not be loaded or may have been deleted.
            </p>
            <Link
              href="/finance/purchase-orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Purchase Orders</span>
            </Link>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <PurchaseOrderEditor initialPO={po} isEditing={true} />
      </DashboardLayout>
    </AuthGuard>
  );
}

