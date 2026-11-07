'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PurchaseOrderItem, POLineItem, VendorItem, POStatus } from '@/lib/types';
import { PurchaseOrderView } from './purchase-order-view';
import { formatINRPlain, numberToIndianWords } from '@/lib/invoice-utils';
import { DEFAULT_BANK_DETAILS } from '@/lib/bank-details';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  Building,
  Calendar,
  Truck,
  CreditCard,
  FileText,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Printer,
  Download,
  Send,
  X,
  UserPlus,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

interface PurchaseOrderEditorProps {
  initialPO?: Partial<PurchaseOrderItem>;
  isEditing?: boolean;
}

const DEFAULT_PO_TERMS = `1. Payment Terms: Net 15 Days from the date of invoice.
2. Delivery Timeline: As per agreed schedule mentioned above.
3. Scope of Work: As per the agreed quotation / project details.
4. GST: Applicable GST is charged as per statutory guidelines.
5. Warranty: As per vendor terms and conditions.
6. Validity: This PO is valid for 30 days from the date of issue.`;

export function PurchaseOrderEditor({ initialPO, isEditing = false }: PurchaseOrderEditorProps) {
  const router = useRouter();

  // Vendors list
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // New Vendor Form State
  const [newVendorForm, setNewVendorForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: 'SERVICE',
  });
  const [addingVendor, setAddingVendor] = useState(false);

  // Core PO state
  const [poNumber, setPoNumber] = useState(initialPO?.poNumber || '');
  const [orderDate, setOrderDate] = useState(
    initialPO?.orderDate || new Date().toISOString().split('T')[0]
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    initialPO?.expectedDeliveryDate ||
      new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState(initialPO?.paymentTerms || 'Net 15 Days');
  const [poValidity, setPoValidity] = useState(initialPO?.poValidity || '30 Days');
  const [projectRefNo, setProjectRefNo] = useState(initialPO?.projectRefNo || 'PRJ-CK-2025-08');
  const [deliveryTerms, setDeliveryTerms] = useState(initialPO?.deliveryTerms || 'As per agreed schedule');
  const [modeOfTransport, setModeOfTransport] = useState(
    initialPO?.modeOfTransport || 'By Courier / Transport'
  );
  const [remarks, setRemarks] = useState(
    initialPO?.remarks || 'Please confirm the order and share the tracking details.'
  );
  const [status, setStatus] = useState<POStatus>((initialPO?.status as POStatus) || 'DRAFT');

  // Vendor state
  const [selectedVendorId, setSelectedVendorId] = useState(initialPO?.vendorId || '');
  const [vendorName, setVendorName] = useState(initialPO?.vendorName || '');
  const [vendorAddress, setVendorAddress] = useState(initialPO?.vendorAddress || '');
  const [vendorGstin, setVendorGstin] = useState(initialPO?.vendorGstin || '');
  const [vendorEmail, setVendorEmail] = useState(initialPO?.vendorEmail || '');
  const [vendorPhone, setVendorPhone] = useState(initialPO?.vendorPhone || '');

  // Buyer details
  const [buyerName, setBuyerName] = useState(
    initialPO?.buyerName || 'CODEKAPS DIGITAL INNOVATIONS PVT. LTD.'
  );
  const [buyerAddress, setBuyerAddress] = useState(
    initialPO?.buyerAddress ||
      'A-12, Sector 4, Noida, Uttar Pradesh – 201301\nIndia'
  );
  const [buyerGstin, setBuyerGstin] = useState(initialPO?.buyerGstin || '03AAMCC6345B1Z0');
  const [buyerPhone, setBuyerPhone] = useState(initialPO?.buyerPhone || '7528835379');
  const [buyerEmail, setBuyerEmail] = useState(initialPO?.buyerEmail || 'info@codekap.in');

  // Inter-state / Intra-state GST toggle
  const [isInterState, setIsInterState] = useState(
    initialPO?.isInterState !== undefined ? initialPO.isInterState : true
  );

  // Bank details toggle
  const [showBankDetails, setShowBankDetails] = useState(
    initialPO?.showBankDetails !== undefined ? initialPO.showBankDetails : true
  );

  // Terms & Conditions
  const [terms, setTerms] = useState(initialPO?.terms || DEFAULT_PO_TERMS);

  // Line items state
  const [items, setItems] = useState<POLineItem[]>(() => {
    if (initialPO?.itemsJson) {
      try {
        return JSON.parse(initialPO.itemsJson);
      } catch {}
    }
    return [
      {
        srNo: 1,
        description: 'Web Development Services',
        deliverables: [
          '(Website Design & Development)',
          '- UI/UX Design',
          '- Frontend & Backend Development',
          '- Testing & Deployment',
        ],
        hsn: '998365',
        qty: 1,
        unit: 'NOS',
        unitPrice: 50000,
        discount: 0,
        taxableAmount: 50000,
        gstRate: 18,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 18,
        igstAmount: 9000,
        totalAmount: 59000,
      },
    ];
  });

  // UI State
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Vendors and Next PO Number
  useEffect(() => {
    const fetchVendorsList = async () => {
      try {
        setLoadingVendors(true);
        const res = await fetch('/api/finance/vendors');
        if (res.ok) {
          const data = await res.json();
          setVendors(data);

          // If no initial vendor selected, auto-select first vendor or ABC Technologies
          if (!selectedVendorId && data.length > 0) {
            const defaultVendor =
              data.find((v: VendorItem) => v.name.toLowerCase().includes('abc')) || data[0];
            if (defaultVendor && !vendorName) {
              applyVendor(defaultVendor);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };

    const fetchNextPoNumber = async () => {
      if (!isEditing && !poNumber) {
        try {
          const res = await fetch('/api/finance/purchase-orders?nextNumber=true');
          if (res.ok) {
            const data = await res.json();
            if (data.nextPONumber) {
              setPoNumber(data.nextPONumber);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch next PO number:', err);
        }
      }
    };

    fetchVendorsList();
    fetchNextPoNumber();
  }, [isEditing]);

  const applyVendor = (vendor: VendorItem) => {
    setSelectedVendorId(vendor.id);
    setVendorName(vendor.name);
    setVendorAddress(vendor.address || '');
    setVendorGstin(vendor.gstin || '');
    setVendorEmail(vendor.email || '');
    setVendorPhone(vendor.phone || '');

    // Auto-detect inter-state vs intra-state based on GSTIN state code
    // CodeKap GSTIN is 03AAMCC6345B1Z0 (State 03: Punjab) or Office in Noida (09: UP)
    if (vendor.gstin && vendor.gstin.length >= 2) {
      const vendorStateCode = vendor.gstin.substring(0, 2);
      // If vendor state is '03' (Punjab), it's intra-state; otherwise inter-state
      setIsInterState(vendorStateCode !== '03');
    }
  };

  const handleVendorSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value;
    if (vId === 'NEW_VENDOR') {
      setShowAddVendorModal(true);
      return;
    }
    const found = vendors.find((v) => v.id === vId);
    if (found) {
      applyVendor(found);
    } else {
      setSelectedVendorId('');
    }
  };

  // Add new vendor directly from modal
  const handleAddNewVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorForm.name.trim()) return;
    try {
      setAddingVendor(true);
      const res = await fetch('/api/finance/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendorForm),
      });
      if (res.ok) {
        const createdVendor = await res.json();
        setVendors((prev) => [...prev, createdVendor]);
        applyVendor(createdVendor);
        setShowAddVendorModal(false);
        setNewVendorForm({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          gstin: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          category: 'SERVICE',
        });
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create vendor');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating vendor');
    } finally {
      setAddingVendor(false);
    }
  };

  // Line item modifications
  const handleItemChange = (index: number, field: keyof POLineItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };

      // Recalculate line totals
      const qty = Number(item.qty) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const taxable = Math.max(0, Number((qty * unitPrice - discount).toFixed(2)));
      const gstRate = Number(item.gstRate) || 0;

      let cgstRate = 0;
      let cgstAmount = 0;
      let sgstRate = 0;
      let sgstAmount = 0;
      let igstRate = 0;
      let igstAmount = 0;

      if (gstRate > 0) {
        if (isInterState) {
          igstRate = gstRate;
          igstAmount = Number(((taxable * igstRate) / 100).toFixed(2));
        } else {
          cgstRate = Number((gstRate / 2).toFixed(2));
          cgstAmount = Number(((taxable * cgstRate) / 100).toFixed(2));
          sgstRate = cgstRate;
          sgstAmount = Number(((taxable * sgstRate) / 100).toFixed(2));
        }
      }

      item.taxableAmount = taxable;
      item.cgstRate = cgstRate;
      item.cgstAmount = cgstAmount;
      item.sgstRate = sgstRate;
      item.sgstAmount = sgstAmount;
      item.igstRate = igstRate;
      item.igstAmount = igstAmount;
      item.totalAmount = Number((taxable + igstAmount + cgstAmount + sgstAmount).toFixed(2));

      copy[index] = item;
      return copy;
    });
  };

  const handleDeliverablesChange = (index: number, text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    handleItemChange(index, 'deliverables', lines);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        srNo: prev.length + 1,
        description: '',
        deliverables: [],
        hsn: '998313',
        qty: 1,
        unit: 'NOS',
        unitPrice: 0,
        discount: 0,
        taxableAmount: 0,
        gstRate: 18,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: isInterState ? 18 : 0,
        igstAmount: 0,
        totalAmount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('A purchase order must contain at least one item.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Totals calculation
  const subtotal = items.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  const totalDiscount = items.reduce((acc, it) => acc + (Number(it.discount) || 0), 0);
  const taxableAmount = items.reduce((acc, it) => acc + (Number(it.taxableAmount) || 0), 0);
  const igstTotal = isInterState ? items.reduce((acc, it) => acc + (Number(it.igstAmount) || 0), 0) : 0;
  const cgstTotal = !isInterState ? items.reduce((acc, it) => acc + (Number(it.cgstAmount) || 0), 0) : 0;
  const sgstTotal = !isInterState ? items.reduce((acc, it) => acc + (Number(it.sgstAmount) || 0), 0) : 0;
  const grandTotal = Number((taxableAmount + igstTotal + cgstTotal + sgstTotal).toFixed(2));
  const amountInWords = numberToIndianWords(grandTotal);

  // Save PO (Create or Update)
  const handleSavePO = async () => {
    if (!vendorName.trim()) {
      setErrorMsg('Please select or specify a Vendor name.');
      return;
    }
    if (items.some((it) => !it.description.trim())) {
      setErrorMsg('Please ensure all line items have a valid description.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const payload = {
        poNumber: poNumber.trim(),
        orderDate,
        expectedDeliveryDate,
        paymentTerms,
        poValidity,
        projectRefNo,
        deliveryTerms,
        modeOfTransport,
        remarks,
        status,
        vendorId: selectedVendorId || null,
        vendorName: vendorName.trim(),
        vendorAddress: vendorAddress.trim(),
        vendorGstin: vendorGstin.trim().toUpperCase(),
        vendorEmail: vendorEmail.trim(),
        vendorPhone: vendorPhone.trim(),
        buyerName,
        buyerAddress,
        buyerGstin,
        buyerPhone,
        buyerEmail,
        items,
        isInterState,
        showBankDetails,
        bankDetailsJson: DEFAULT_BANK_DETAILS,
        terms,
        subtotal,
        totalDiscount,
        taxableAmount,
        cgstTotal,
        sgstTotal,
        igstTotal,
        grandTotal,
        amountInWords,
      };

      const url = isEditing && initialPO?.id
        ? `/api/finance/purchase-orders/${initialPO.id}`
        : '/api/finance/purchase-orders';
      const method = isEditing && initialPO?.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save Purchase Order');
      }

      const savedPO = await res.json();
      setSuccessMsg('Purchase Order saved successfully!');
      setTimeout(() => {
        router.push('/finance/purchase-orders');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Constructed PO item for live preview
  const livePOData: PurchaseOrderItem = {
    id: initialPO?.id || 'live_preview',
    poNumber: poNumber || 'CK-PO-2025-001',
    orderDate,
    expectedDeliveryDate,
    paymentTerms,
    poValidity,
    projectRefNo,
    deliveryTerms,
    modeOfTransport,
    remarks,
    status,
    vendorId: selectedVendorId,
    vendorName: vendorName || 'Vendor / Supplier Name',
    vendorAddress: vendorAddress || 'Vendor Address',
    vendorGstin: vendorGstin || '09ABCDE1234F1Z5',
    vendorEmail: vendorEmail || 'sales@vendor.com',
    vendorPhone: vendorPhone || '+91-9876543210',
    buyerName,
    buyerAddress,
    buyerGstin,
    buyerPhone,
    buyerEmail,
    itemsJson: JSON.stringify(items),
    isInterState,
    subtotal,
    totalDiscount,
    taxableAmount,
    cgstTotal,
    sgstTotal,
    igstTotal,
    grandTotal,
    amountInWords,
    showBankDetails,
    bankDetailsJson: JSON.stringify(DEFAULT_BANK_DETAILS),
    terms,
    signatoryName: 'Authorized Signatory',
    signatoryCompany: 'CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED',
    signatureUrl: '/images/aman-signature.png',
    createdAt: initialPO?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg">
          <button
            onClick={() => setPreviewMode(false)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Editor</span>
          </button>
          <span className="text-xs font-semibold text-slate-300">
            Previewing: <strong className="text-amber-400">{poNumber}</strong>
          </span>
          <button
            onClick={handleSavePO}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save & Exit'}</span>
          </button>
        </div>

        <PurchaseOrderView po={livePOData} onClose={() => setPreviewMode(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <button
              onClick={() => router.push('/finance/purchase-orders')}
              className="hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Purchase Orders
            </button>
            <span>/</span>
            <span className="text-slate-900">{isEditing ? 'Edit Order' : 'Create New'}</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#004B35]" />
            <span>{isEditing ? `Edit Purchase Order — ${poNumber}` : 'Create Purchase Order'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSavePO}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004B35] hover:bg-[#003828] text-white text-xs font-black shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update PO' : 'Save Purchase Order'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): PO Meta, Vendor, Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Document Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>1. Order Information & Identifiers</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">PO Number</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="CK-PO-2025-001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Order Date</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Expected Delivery</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                >
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Immediate / Advance">Immediate / Advance</option>
                  <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                  <option value="On Delivery / Milestone">On Delivery / Milestone</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">PO Validity</label>
                <input
                  type="text"
                  value={poValidity}
                  onChange={(e) => setPoValidity(e.target.value)}
                  placeholder="30 Days"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Project Reference</label>
                <input
                  type="text"
                  value={projectRefNo}
                  onChange={(e) => setProjectRefNo(e.target.value)}
                  placeholder="PRJ-CK-2025-08"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as POStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ISSUED">Issued</option>
                  <option value="APPROVED">Approved</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Vendor Details (Issued To) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>2. Vendor / Supplier Details (Issued To)</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Quick Add Vendor</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Existing Vendor from CRM
                </label>
                <select
                  value={selectedVendorId}
                  onChange={handleVendorSelectChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                >
                  <option value="">-- Choose Vendor / Supplier --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gstin || 'No GSTIN'})
                    </option>
                  ))}
                  <option value="NEW_VENDOR">+ Create New Vendor...</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Vendor / Company Name *</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. ABC Technologies Pvt. Ltd."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Vendor GSTIN</label>
                <input
                  type="text"
                  value={vendorGstin}
                  onChange={(e) => setVendorGstin(e.target.value)}
                  placeholder="09ABCDE1234F1Z5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  placeholder="sales@abctech.in"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  placeholder="+91-9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Address</label>
                <textarea
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                  rows={2}
                  placeholder="123 Business Park, Sector 62, Noida, Uttar Pradesh - 201309&#10;India"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Itemized Order Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>3. Itemized Goods & Services</span>
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl text-xs">
                  <span className="font-bold text-slate-700">GST Mode:</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      checked={isInterState}
                      onChange={() => setIsInterState(true)}
                      className="text-emerald-600"
                    />
                    <span className="text-[11px] font-bold text-slate-800">Inter-state (IGST)</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer ml-1">
                    <input
                      type="radio"
                      checked={!isInterState}
                      onChange={() => setIsInterState(false)}
                      className="text-emerald-600"
                    />
                    <span className="text-[11px] font-bold text-slate-800">Intra-state (CGST+SGST)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Line Item</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      Item #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-rose-600 hover:text-rose-800 p-1 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Item / Service Title *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="e.g. Web Development Services"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        HSN / SAC
                      </label>
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                        placeholder="998365"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white text-center focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Unit Rate (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white text-right focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Scope Deliverables / Detailed Bullets (1 per line)
                      </label>
                      <textarea
                        rows={2}
                        value={(item.deliverables || []).join('\n')}
                        onChange={(e) => handleDeliverablesChange(index, e.target.value)}
                        placeholder="(Website Design & Development)&#10;- UI/UX Design&#10;- Frontend & Backend Development&#10;- Testing & Deployment"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-800 bg-white leading-snug focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white text-right focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        GST Rate (%)
                      </label>
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                      >
                        <option value="0">0% (Exempt)</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18% (Standard IT/Service)</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Row Total (₹)
                      </label>
                      <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-black text-slate-950 font-mono text-right">
                        ₹{formatINRPlain(item.totalAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Summary, Other Details, Terms, Bank Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 4: Live Totals & Calculation Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Summary & Dynamic Tax</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal (Gross):</span>
                <span className="font-mono font-bold">₹{formatINRPlain(subtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Total Discount:</span>
                  <span className="font-mono font-bold">-₹{formatINRPlain(totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-100">
                <span>Taxable Amount:</span>
                <span className="font-mono font-black">₹{formatINRPlain(taxableAmount)}</span>
              </div>

              {isInterState ? (
                <div className="flex justify-between text-slate-700">
                  <span>IGST Total:</span>
                  <span className="font-mono font-bold">₹{formatINRPlain(igstTotal)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-700">
                    <span>CGST Total:</span>
                    <span className="font-mono font-bold">₹{formatINRPlain(cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>SGST Total:</span>
                    <span className="font-mono font-bold">₹{formatINRPlain(sgstTotal)}</span>
                  </div>
                </>
              )}

              <div className="bg-[#FEF2C8] p-3.5 rounded-xl border border-amber-300 mt-2 flex justify-between items-center text-slate-950 font-black">
                <span className="text-xs uppercase tracking-wider">Grand Total:</span>
                <span className="text-base font-mono">₹{formatINRPlain(grandTotal)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                <span className="font-bold text-[10px] text-slate-500 uppercase block mb-0.5">
                  Amount in Words:
                </span>
                <p className="italic font-extrabold text-slate-900 leading-tight">
                  {amountInWords}
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Other Procurement Logistics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Other Details</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Delivery Terms</label>
                <input
                  type="text"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  placeholder="As per agreed schedule"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mode of Transport</label>
                <input
                  type="text"
                  value={modeOfTransport}
                  onChange={(e) => setModeOfTransport(e.target.value)}
                  placeholder="By Courier / Transport"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Special Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Please confirm the order and share the tracking details."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Bank Details Toggle */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Company Bank Details
                </h3>
                <p className="text-[11px] text-slate-500">
                  Include CodeKap HDFC bank details on PO sheet
                </p>
              </div>
              <input
                type="checkbox"
                checked={showBankDetails}
                onChange={(e) => setShowBankDetails(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm cursor-pointer"
              />
            </div>
            {showBankDetails && (
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-700 space-y-1 font-mono">
                <div><strong>A/C:</strong> CODEKAPS DIGITAL INNOVATIONS PVT LTD</div>
                <div><strong>Bank:</strong> HDFC Bank Ltd</div>
                <div><strong>A/C No:</strong> 50200112201868</div>
                <div><strong>IFSC:</strong> HDFC0002684</div>
              </div>
            )}
          </div>

          {/* Card 7: Terms & Conditions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Terms & Conditions</span>
            </h2>
            <textarea
              rows={6}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-[11px] text-slate-800 font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#004B35]"
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Quick Add Vendor Modal */}
      {/* ============================================================== */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Add New Vendor / Supplier</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddVendorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewVendor} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={newVendorForm.name}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })}
                  placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={newVendorForm.gstin}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, gstin: e.target.value })}
                    placeholder="09ABCDE1234F1Z5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newVendorForm.contactPerson}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, contactPerson: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newVendorForm.email}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, email: e.target.value })}
                    placeholder="billing@acme.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newVendorForm.phone}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, phone: e.target.value })}
                    placeholder="+91-9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={newVendorForm.address}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, address: e.target.value })}
                  placeholder="Plot 12, Tech Zone, Greater Noida, UP - 201306"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingVendor}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  {addingVendor ? 'Saving...' : 'Save & Select Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

