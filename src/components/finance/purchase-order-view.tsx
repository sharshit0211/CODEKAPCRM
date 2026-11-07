'use client';

import React, { useState, useRef } from 'react';
import { PurchaseOrderItem, POLineItem } from '@/lib/types';
import { formatINRPlain, numberToIndianWords } from '@/lib/invoice-utils';
import { DEFAULT_BANK_DETAILS } from '@/lib/bank-details';
import {
  Printer,
  Download,
  Mail,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Send,
  Loader2,
  Building,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PurchaseOrderViewProps {
  po: PurchaseOrderItem;
  onClose?: () => void;
  onStatusChange?: (newStatus: 'DRAFT' | 'ISSUED' | 'APPROVED' | 'CANCELLED') => void;
}

export function PurchaseOrderView({ po, onClose, onStatusChange }: PurchaseOrderViewProps) {
  const [downloading, setDownloading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(po.vendorEmail || '');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  const items: POLineItem[] = React.useMemo(() => {
    try {
      return JSON.parse(po.itemsJson || '[]');
    } catch {
      return [];
    }
  }, [po.itemsJson]);

  const bankDetails = React.useMemo(() => {
    try {
      if (po.bankDetailsJson) {
        return {
          ...DEFAULT_BANK_DETAILS,
          ...JSON.parse(po.bankDetailsJson),
        };
      }
    } catch {}
    return DEFAULT_BANK_DETAILS;
  }, [po.bankDetailsJson]);

  const termsList = React.useMemo(() => {
    if (po.terms) {
      return po.terms.split('\n').filter((t) => t.trim().length > 0);
    }
    return [
      '1. Payment Terms: Net 15 Days from the date of invoice.',
      '2. Delivery Timeline: As per agreed schedule mentioned above.',
      '3. Scope of Work: As per the agreed quotation / project details.',
      '4. GST: Applicable GST is charged as per statutory guidelines.',
      '5. Warranty: As per vendor terms and conditions.',
      '6. Validity: This PO is valid for 30 days from the date of issue.',
    ];
  }, [po.terms]);

  const totalQty = items.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
  const grandTotal = Number(po.grandTotal || 0);
  const amountInWords = po.amountInWords || numberToIndianWords(grandTotal);

  // Client-Side Print
  const handlePrint = () => {
    window.print();
  };

  // High-Resolution PDF Download using html2canvas and jsPDF
  const handleDownloadPDF = async () => {
    if (!sheetRef.current || downloading) return;
    try {
      setDownloading(true);

      const element = sheetRef.current;
      const html2canvasFn = (html2canvas as any).default || html2canvas;
      const canvas = await (html2canvasFn as any)(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multi-page if height exceeds single A4 page (297mm)
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${po.poNumber || 'Purchase_Order'}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback to window.print if canvas fails
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  // Send Email directly to vendor
  const handleSendEmail = async () => {
    if (!recipientEmail || emailSending) return;
    try {
      setEmailSending(true);
      setEmailStatus(null);
      const res = await fetch(`/api/finance/purchase-orders/${po.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: recipientEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus({ success: true, message: `PO sent successfully to ${recipientEmail}!` });
        if (onStatusChange && po.status === 'DRAFT') {
          onStatusChange('ISSUED');
        }
      } else {
        setEmailStatus({ success: false, message: data.error || 'Failed to dispatch email.' });
      }
    } catch (err: any) {
      setEmailStatus({ success: false, message: err.message || 'Network error sending email.' });
    } finally {
      setEmailSending(false);
    }
  };

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
    <div className="relative font-sans">
      {/* ============================================================== */}
      {/* Top Action Bar (Hidden in Print) */}
      {/* ============================================================== */}
      <div className="print:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md px-6 py-3.5 mb-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl text-white">
        <div className="flex items-center gap-3">
          <img
            src="/images/codekap-logo.png"
            alt="CodeKap"
            className="w-9 h-9 object-contain rounded-lg shrink-0 bg-white/10 p-0.5"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
                Purchase Order Preview — {po.poNumber}
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadge(po.status)}`}>
                {po.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {po.vendorName} • ₹{formatINRPlain(grandTotal)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700 hover:text-white"
            title="Download PDF directly"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloading ? 'Rendering...' : 'Download PDF'}</span>
          </button>

          {/* Native Print / Save PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5C324] hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Open Print Dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>

          {/* Email to Vendor */}
          <button
            onClick={() => setEmailModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Email to Vendor"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Vendor</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* Email Modal Dialog */}
      {/* ============================================================== */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Email Purchase Order to Vendor</span>
              </h3>
              <button
                onClick={() => {
                  setEmailModalOpen(false);
                  setEmailStatus(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Email Address</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="vendor@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div>
                  <span className="font-bold">PO Number:</span> {po.poNumber}
                </div>
                <div>
                  <span className="font-bold">Vendor:</span> {po.vendorName}
                </div>
                <div>
                  <span className="font-bold">Order Value:</span> ₹{formatINRPlain(grandTotal)}
                </div>
              </div>

              {emailStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    emailStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {emailStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{emailStatus.message}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={emailSending || !recipientEmail}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all"
              >
                {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{emailSending ? 'Sending...' : 'Send PO Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Actual A4 Printable Purchase Order Sheet */}
      {/* Matches the second visual mockup exactly */}
      {/* ============================================================== */}
      <div
        ref={sheetRef}
        id="purchase-order-sheet"
        className="relative bg-white text-slate-900 border border-slate-400 shadow-2xl rounded-xs max-w-[850px] mx-auto p-8 font-sans print:shadow-none print:border-none print:m-0 print:p-6 print:max-w-none print:w-full overflow-hidden"
        style={{ minHeight: '1100px' }}
      >
        {/* Top-right 'Original' badge outside main box as shown in mockup */}
        <div className="flex justify-end mb-1 text-[11px] font-medium text-slate-600">
          <span>Original</span>
        </div>

        {/* Outer border wrapper matching the visual layout */}
        <div className="border border-slate-500 relative">
          {/* Subtle Watermark Logo */}
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-0 overflow-hidden">
            <div className="relative opacity-[0.04] print:opacity-[0.05] flex flex-col items-center justify-center">
              <img
                src="/images/codekap-logo.png"
                alt="CodeKap Watermark"
                className="w-72 h-72 object-contain select-none"
              />
              <span className="text-3xl font-black uppercase tracking-[0.35em] text-slate-900 mt-3 select-none">
                CODEKAP
              </span>
              <span className="text-xs font-bold tracking-[0.4em] uppercase text-slate-700 mt-1 select-none">
                Digital Innovations Pvt Ltd
              </span>
            </div>
          </div>

          <div className="relative z-10">
            {/* ========================================================== */}
            {/* 1. Header: Logo & Company on Left + Golden Badge on Right */}
            {/* ========================================================== */}
            <div className="p-4 flex items-center justify-between border-b border-slate-500">
              {/* Left: Official CodeKap Logo + Company Identity */}
              <div className="flex items-center gap-3.5">
                <img
                  src="/images/codekap-logo.png"
                  alt="CodeKap"
                  className="w-16 h-16 object-contain shrink-0"
                />
                <div className="space-y-0.5">
                  <h1 className="text-sm font-black uppercase tracking-tight text-slate-950 leading-tight">
                    CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED
                  </h1>
                  <p className="text-[11px] text-slate-700">
                    <span className="font-semibold">Email:</span> info@codekap.in
                  </p>
                  <p className="text-[11px] text-slate-700">
                    <span className="font-semibold">Phone no.:</span> 7528835379/917528835379
                  </p>
                  <p className="text-[11px] text-slate-900 font-bold font-mono">
                    <span>GSTIN:</span> 03AAMCC6345B1Z0
                  </p>
                </div>
              </div>

              {/* Right: Prominent PURCHASE ORDER Badge */}
              <div className="pr-2">
                <div className="bg-[#F5C324] text-slate-950 px-7 py-2.5 rounded-lg shadow-2xs text-center border border-amber-400">
                  <span className="text-base font-black uppercase tracking-wider block">
                    PURCHASE ORDER
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* 2. 4-Column Order Meta Grid */}
            {/* ========================================================== */}
            <div className="grid grid-cols-4 divide-x divide-slate-500 border-b border-slate-500 text-[11px] text-left">
              <div className="p-2.5">
                <span className="font-bold text-slate-700 block text-[10px]">PO Number</span>
                <span className="font-black text-slate-950 text-xs font-mono">{po.poNumber}</span>
              </div>
              <div className="p-2.5">
                <span className="font-bold text-slate-700 block text-[10px]">PO Date</span>
                <span className="font-bold text-slate-950">{po.orderDate}</span>
              </div>
              <div className="p-2.5">
                <span className="font-bold text-slate-700 block text-[10px]">Expected Delivery Date</span>
                <span className="font-bold text-slate-950">{po.expectedDeliveryDate || '15-10-2025'}</span>
              </div>
              <div className="p-2.5">
                <span className="font-bold text-slate-700 block text-[10px]">Payment Terms</span>
                <span className="font-bold text-slate-950">{po.paymentTerms || 'Net 15 Days'}</span>
              </div>
            </div>

            {/* ========================================================== */}
            {/* 3. Vendor Details & Bill To / Ship To Grid */}
            {/* ========================================================== */}
            <div className="grid grid-cols-2 divide-x divide-slate-500 border-b border-slate-500 text-[11px]">
              {/* Left: Vendor / Supplier Details */}
              <div>
                <div className="bg-[#FEF2C8] px-3 py-1.5 border-b border-slate-500 font-bold text-slate-950 text-[11px]">
                  Vendor / Supplier Details
                </div>
                <div className="p-3 space-y-1 text-slate-800">
                  <div className="font-black text-xs text-slate-950">{po.vendorName}</div>
                  <div className="text-[11px] text-slate-700 whitespace-pre-line leading-snug">
                    {po.vendorAddress || 'Vendor Address'}
                  </div>
                  {po.vendorGstin && (
                    <div className="text-[11px] font-bold font-mono text-slate-900 pt-0.5">
                      <span>GSTIN: </span>{po.vendorGstin}
                    </div>
                  )}
                  {po.vendorEmail && (
                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold">Email: </span>{po.vendorEmail}
                    </div>
                  )}
                  {po.vendorPhone && (
                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold">Phone: </span>{po.vendorPhone}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Bill To / Ship To Details */}
              <div>
                <div className="bg-[#FEF2C8] px-3 py-1.5 border-b border-slate-500 font-bold text-slate-950 text-[11px]">
                  Bill To / Ship To
                </div>
                <div className="p-3 space-y-1 text-slate-800">
                  <div className="font-black text-xs text-slate-950">
                    {po.buyerName || 'CODEKAPS DIGITAL INNOVATIONS PVT. LTD.'}
                  </div>
                  <div className="text-[11px] text-slate-700 whitespace-pre-line leading-snug">
                    {po.buyerAddress || 'A-12, Sector 4, Noida, Uttar Pradesh – 201301\nIndia'}
                  </div>
                  <div className="text-[11px] font-bold font-mono text-slate-900 pt-0.5">
                    <span>GSTIN: </span>{po.buyerGstin || '03AAMCC6345B1Z0'}
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <span className="font-semibold">Phone: </span>{po.buyerPhone || '7528835379'}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* 4. Itemized Order Table */}
            {/* ========================================================== */}
            <div className="border-b border-slate-500 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5C324] text-slate-950 font-bold border-b border-slate-500 text-[10px]">
                    <th className="py-2 px-2 border-r border-slate-500 text-center w-8">Sr. No.</th>
                    <th className="py-2 px-3 border-r border-slate-500">Item / Service Description</th>
                    <th className="py-2 px-2 border-r border-slate-500 text-center w-14">HSN/SAC</th>
                    <th className="py-2 px-2 border-r border-slate-500 text-center w-10">Qty</th>
                    <th className="py-2 px-2 border-r border-slate-500 text-right w-16">Unit Price (₹)</th>
                    <th className="py-2 px-2 border-r border-slate-500 text-right w-14">Discount (₹)</th>
                    <th className="py-2 px-2 border-r border-slate-500 text-right w-18">Taxable Amt (₹)</th>

                    {/* Dynamic Tax Columns: IGST if Inter-state, else CGST + SGST */}
                    {po.isInterState ? (
                      <>
                        <th className="py-2 px-2 border-r border-slate-500 text-center w-12">IGST (%)</th>
                        <th className="py-2 px-2 border-r border-slate-500 text-right w-16">IGST Amt (₹)</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2 px-1 border-r border-slate-500 text-center w-10">CGST (%)</th>
                        <th className="py-2 px-1 border-r border-slate-500 text-right w-14">CGST (₹)</th>
                        <th className="py-2 px-1 border-r border-slate-500 text-center w-10">SGST (%)</th>
                        <th className="py-2 px-1 border-r border-slate-500 text-right w-14">SGST (₹)</th>
                      </>
                    )}

                    <th className="py-2 px-3 text-right w-18">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400 text-[11px]">
                  {items.map((item, idx) => (
                    <tr key={idx} className="align-top hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 border-r border-slate-500 text-center font-bold">
                        {item.srNo || idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-500">
                        <div className="font-extrabold text-slate-950">{item.description}</div>
                        {item.deliverables && item.deliverables.length > 0 && (
                          <div className="text-[10px] text-slate-700 mt-1 space-y-0.5 leading-tight">
                            {item.deliverables.map((del, dIdx) => (
                              <div key={dIdx}>{del}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 border-r border-slate-500 text-center font-mono text-[10px]">
                        {item.hsn || '-'}
                      </td>
                      <td className="py-2.5 px-2 border-r border-slate-500 text-center font-bold">
                        {item.qty}
                      </td>
                      <td className="py-2.5 px-2 border-r border-slate-500 text-right font-mono">
                        {formatINRPlain(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-2 border-r border-slate-500 text-right font-mono text-slate-700">
                        {formatINRPlain(item.discount || 0)}
                      </td>
                      <td className="py-2.5 px-2 border-r border-slate-500 text-right font-mono font-medium">
                        {formatINRPlain(item.taxableAmount)}
                      </td>

                      {/* Tax Columns */}
                      {po.isInterState ? (
                        <>
                          <td className="py-2.5 px-2 border-r border-slate-500 text-center font-mono">
                            {item.gstRate || 0}%
                          </td>
                          <td className="py-2.5 px-2 border-r border-slate-500 text-right font-mono font-medium">
                            {formatINRPlain(item.igstAmount || 0)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 px-1 border-r border-slate-500 text-center font-mono">
                            {item.cgstRate || (item.gstRate ? item.gstRate / 2 : 0)}%
                          </td>
                          <td className="py-2.5 px-1 border-r border-slate-500 text-right font-mono">
                            {formatINRPlain(item.cgstAmount || 0)}
                          </td>
                          <td className="py-2.5 px-1 border-r border-slate-500 text-center font-mono">
                            {item.sgstRate || (item.gstRate ? item.gstRate / 2 : 0)}%
                          </td>
                          <td className="py-2.5 px-1 border-r border-slate-500 text-right font-mono">
                            {formatINRPlain(item.sgstAmount || 0)}
                          </td>
                        </>
                      )}

                      <td className="py-2.5 px-3 text-right font-bold text-slate-950 font-mono">
                        {formatINRPlain(item.totalAmount)}
                      </td>
                    </tr>
                  ))}

                  {/* Sub Total Row with Light Yellow Tint */}
                  <tr className="bg-[#FEF2C8] font-bold text-[11px] border-t border-slate-500">
                    <td colSpan={2} className="py-2 px-3 border-r border-slate-500 text-left font-black">
                      Sub Total
                    </td>
                    <td className="py-2 px-2 border-r border-slate-500"></td>
                    <td className="py-2 px-2 border-r border-slate-500 text-center font-black">
                      {totalQty}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-500"></td>
                    <td className="py-2 px-2 border-r border-slate-500 text-right font-mono">
                      {po.totalDiscount > 0 ? formatINRPlain(po.totalDiscount) : ''}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-500 text-right font-black font-mono">
                      {formatINRPlain(po.taxableAmount)}
                    </td>

                    {po.isInterState ? (
                      <>
                        <td className="py-2 px-2 border-r border-slate-500"></td>
                        <td className="py-2 px-2 border-r border-slate-500 text-right font-black font-mono">
                          {formatINRPlain(po.igstTotal)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-1 border-r border-slate-500"></td>
                        <td className="py-2 px-1 border-r border-slate-500 text-right font-black font-mono">
                          {formatINRPlain(po.cgstTotal)}
                        </td>
                        <td className="py-2 px-1 border-r border-slate-500"></td>
                        <td className="py-2 px-1 border-r border-slate-500 text-right font-black font-mono">
                          {formatINRPlain(po.sgstTotal)}
                        </td>
                      </>
                    )}

                    <td className="py-2 px-3 text-right font-black text-slate-950 font-mono">
                      {formatINRPlain(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ========================================================== */}
            {/* 5. Amount in Words & Totals Summary Box */}
            {/* ========================================================== */}
            <div className="grid grid-cols-12 border-b border-slate-500 text-[11px]">
              {/* Left: Amount in Words */}
              <div className="col-span-7 p-3 border-r border-slate-500 flex flex-col justify-between">
                <div>
                  <span className="font-black text-slate-900 block text-[11px] mb-1">
                    Amount in Words
                  </span>
                  <p className="font-extrabold text-slate-900 text-xs leading-snug">
                    {amountInWords}
                  </p>
                </div>
              </div>

              {/* Right: Taxable Amount, Taxes, and Grand Total */}
              <div className="col-span-5 divide-y divide-slate-400">
                <div className="flex justify-between p-2 text-slate-800">
                  <span className="font-bold">Taxable Amount (₹)</span>
                  <span className="font-mono font-black">{formatINRPlain(po.taxableAmount)}</span>
                </div>

                {po.isInterState ? (
                  <div className="flex justify-between p-2 text-slate-800">
                    <span className="font-bold">
                      IGST ({items.length > 0 ? `${items[0].gstRate}%` : '18%'})
                    </span>
                    <span className="font-mono font-black">{formatINRPlain(po.igstTotal)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between p-1.5 px-2 text-slate-800">
                      <span className="font-bold">CGST ({items.length > 0 ? `${(items[0].gstRate || 18) / 2}%` : '9%'})</span>
                      <span className="font-mono font-black">{formatINRPlain(po.cgstTotal)}</span>
                    </div>
                    <div className="flex justify-between p-1.5 px-2 text-slate-800">
                      <span className="font-bold">SGST ({items.length > 0 ? `${(items[0].gstRate || 18) / 2}%` : '9%'})</span>
                      <span className="font-mono font-black">{formatINRPlain(po.sgstTotal)}</span>
                    </div>
                  </>
                )}

                {/* Grand Total Row with Light Yellow Tint */}
                <div className="bg-[#FEF2C8] flex justify-between p-2 font-black text-xs text-slate-950">
                  <span>Grand Total (₹)</span>
                  <span className="font-mono text-sm">{formatINRPlain(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* 6. Bank Details (Left) & Other Details (Right) */}
            {/* ========================================================== */}
            <div className="grid grid-cols-2 divide-x divide-slate-500 border-b border-slate-500 text-[11px]">
              {/* Left: Bank Details (For Payment) */}
              <div>
                <div className="bg-[#FEF2C8] px-3 py-1.5 border-b border-slate-500 font-bold text-slate-950 text-[11px]">
                  Bank Details (For Payment)
                </div>
                {po.showBankDetails ? (
                  <div className="p-3 space-y-1 text-slate-800 font-medium">
                    <div className="flex">
                      <span className="w-28 font-bold">A/C Holder Name</span>
                      <span>: {bankDetails.accountHolderName || 'CODEKAPS DIGITAL INNOVATIONS PVT LTD'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-bold">Bank Name</span>
                      <span>: {bankDetails.bankName || 'HDFC Bank Ltd'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-bold">A/C No.</span>
                      <span className="font-mono font-black">: {bankDetails.accountNo || '50200112201868'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-bold">IFSC Code</span>
                      <span className="font-mono font-black">: {bankDetails.ifscCode || 'HDFC0002684'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-xs italic text-slate-500">
                    Direct bank payment details withheld for this purchase order.
                  </div>
                )}
              </div>

              {/* Right: Other Details */}
              <div>
                <div className="bg-[#FEF2C8] px-3 py-1.5 border-b border-slate-500 font-bold text-slate-950 text-[11px]">
                  Other Details
                </div>
                <div className="p-3 space-y-1 text-slate-800 font-medium">
                  <div className="flex">
                    <span className="w-28 font-bold">PO Validity</span>
                    <span>: {po.poValidity || '30 Days'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-bold">Delivery Terms</span>
                    <span>: {po.deliveryTerms || 'As per agreed schedule'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-bold">Mode of Transport</span>
                    <span>: {po.modeOfTransport || 'By Courier / Transport'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-28 font-bold shrink-0">Remarks</span>
                    <span className="leading-tight">
                      : {po.remarks || 'Please confirm the order and share the tracking details.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* 7. Terms & Conditions (Left) & Authorized Signatory (Right) */}
            {/* ========================================================== */}
            <div className="grid grid-cols-12 divide-x divide-slate-500">
              {/* Left Column: Terms & Conditions */}
              <div className="col-span-7 flex flex-col">
                <div className="bg-[#FEF2C8] px-3 py-1.5 border-b border-slate-500 font-bold text-slate-950 text-[11px]">
                  Terms & Conditions:
                </div>
                <div className="p-3 space-y-1 text-[10px] text-slate-800 leading-tight flex-1">
                  {termsList.map((term, tIdx) => (
                    <div key={tIdx} className="leading-snug">
                      {term}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Authorized Signatory */}
              <div className="col-span-5 p-3 flex flex-col justify-between text-right text-[11px]">
                <div>
                  <span className="font-bold text-slate-950 text-[10.5px] block leading-tight">
                    For, CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED
                  </span>
                </div>

                {/* Actual Official Signature Image */}
                <div className="my-2 flex flex-col items-end">
                  <img
                    src={po.signatureUrl || '/images/aman-signature.png'}
                    alt="Authorized Signatory"
                    className="h-14 w-auto max-w-[160px] object-contain select-none mix-blend-multiply"
                  />
                  <div className="border-t border-slate-400 w-44 pt-1 mt-0.5 text-center">
                    <span className="font-bold text-slate-950 text-[10.5px] block">
                      Authorized Signatory
                    </span>
                    <span className="text-[9.5px] text-slate-600 font-medium block">
                      (CodeKap)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 8. Branded Footer */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between pt-3 text-[11px] text-slate-900 font-bold border-t border-slate-300 mt-2">
          <div className="text-[#004B35] font-black tracking-tight">
            Your Vision. Our Code.
          </div>
          <div className="text-[10px] text-slate-500 font-normal italic">
            This is a computer-generated Purchase Order.
          </div>
          <div className="text-slate-900 font-semibold font-mono">
            www.codekap.in
          </div>
        </div>
      </div>
    </div>
  );
}
