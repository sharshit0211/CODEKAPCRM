'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AuthGuard } from '@/components/auth-guard';
import { PurchaseOrderEditor } from '@/components/finance/purchase-order-editor';

export default function CreatePurchaseOrderPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <PurchaseOrderEditor />
      </DashboardLayout>
    </AuthGuard>
  );
}

