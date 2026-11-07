import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';
import { numberToIndianWords } from '@/lib/invoice-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_PO_TERMS = `1. Payment Terms: Net 15 Days from the date of invoice.
2. Delivery Timeline: As per agreed schedule mentioned above.
3. Scope of Work: As per the agreed quotation / project details.
4. GST: Applicable GST is charged as per statutory guidelines.
5. Warranty: As per vendor terms and conditions.
6. Validity: This PO is valid for 30 days from the date of issue.`;

export async function GET(req: Request) {
  try {
    await ensureSeedData();

    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();

    if (searchParams.get('nextNumber') === 'true') {
      const allPOs = await prisma.purchaseOrder.findMany({
        select: { poNumber: true },
      });

      let maxNum = 0;
      const regex = new RegExp(`CK-PO-${currentYear}-(\\d+)`, 'i');

      for (const po of allPOs) {
        const match = po.poNumber.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        } else {
          // General match for any CK-PO-YYYY-XXX
          const generalMatch = po.poNumber.match(/CK-PO-\d{4}-(\\d+)/i);
          if (generalMatch) {
            const num = parseInt(generalMatch[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      }

      const nextSequence = String(maxNum + 1).padStart(3, '0');
      const nextPONumber = `CK-PO-${currentYear}-${nextSequence}`;

      return NextResponse.json({
        nextPONumber,
        year: currentYear,
        sequence: maxNum + 1,
      });
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(purchaseOrders, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[Purchase Orders GET Error]:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();

    const {
      poNumber: requestedPONumber,
      orderDate = new Date().toISOString().split('T')[0],
      expectedDeliveryDate = '',
      paymentTerms = 'Net 15 Days',
      poValidity = '30 Days',
      projectRefNo = '',
      deliveryTerms = 'As per agreed schedule',
      modeOfTransport = 'By Courier / Transport',
      remarks = '',
      status = 'DRAFT',

      // Vendor details
      vendorId = null,
      vendorName,
      vendorAddress = '',
      vendorGstin = '',
      vendorEmail = '',
      vendorPhone = '',

      // Buyer details
      buyerName = 'CODEKAPS DIGITAL INNOVATIONS PVT. LTD.',
      buyerAddress = 'A-12, Sector 4, Noida, Uttar Pradesh – 201301\nIndia',
      buyerGstin = '03AAMCC6345B1Z0',
      buyerPhone = '7528835379',
      buyerEmail = 'info@codekap.in',

      // Items & taxes
      items = [],
      isInterState = true,
      showBankDetails = true,
      bankDetailsJson = null,
      terms = DEFAULT_PO_TERMS,
      signatoryName = 'Authorized Signatory',
      signatoryCompany = 'CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED',
      signatureUrl = '/images/aman-signature.png',
      notes = '',
      createdById = null,
      createdByName = null,
    } = body;

    if (!vendorName || !vendorName.trim()) {
      return NextResponse.json({ error: 'Vendor name is required.' }, { status: 400 });
    }

    // Determine unique PO Number
    const currentYear = new Date().getFullYear();
    let finalPONumber = (requestedPONumber || '').trim();

    if (!finalPONumber) {
      const allPOs = await prisma.purchaseOrder.findMany({ select: { poNumber: true } });
      let maxNum = 0;
      const regex = new RegExp(`CK-PO-${currentYear}-(\\d+)`, 'i');
      for (const po of allPOs) {
        const match = po.poNumber.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      finalPONumber = `CK-PO-${currentYear}-${String(maxNum + 1).padStart(3, '0')}`;
    } else {
      // Check collision
      const existing = await prisma.purchaseOrder.findUnique({
        where: { poNumber: finalPONumber },
      });
      if (existing) {
        const allPOs = await prisma.purchaseOrder.findMany({ select: { poNumber: true } });
        let maxNum = 0;
        const regex = new RegExp(`CK-PO-${currentYear}-(\\d+)`, 'i');
        for (const po of allPOs) {
          const match = po.poNumber.match(regex);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
        finalPONumber = `CK-PO-${currentYear}-${String(maxNum + 1).padStart(3, '0')}`;
      }
    }

    // Process line items and compute taxes
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const computedItems = items.map((it: any, idx: number) => {
      const qty = Number(it.qty) || 1;
      const unitPrice = Number(it.unitPrice || it.rate) || 0;
      const discount = Number(it.discount) || 0;
      const lineTaxable = Math.max(0, Number((qty * unitPrice - discount).toFixed(2)));
      const gstRate = Number(it.gstRate) || 0;

      let cgstRate = 0;
      let cgstAmount = 0;
      let sgstRate = 0;
      let sgstAmount = 0;
      let igstRate = 0;
      let igstAmount = 0;

      if (gstRate > 0) {
        if (isInterState) {
          igstRate = gstRate;
          igstAmount = Number(((lineTaxable * igstRate) / 100).toFixed(2));
        } else {
          cgstRate = Number((gstRate / 2).toFixed(2));
          cgstAmount = Number(((lineTaxable * cgstRate) / 100).toFixed(2));
          sgstRate = cgstRate;
          sgstAmount = Number(((lineTaxable * sgstRate) / 100).toFixed(2));
        }
      }

      const totalAmount = Number((lineTaxable + igstAmount + cgstAmount + sgstAmount).toFixed(2));

      subtotal += qty * unitPrice;
      totalDiscount += discount;
      taxableAmount += lineTaxable;
      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
      igstTotal += igstAmount;

      return {
        srNo: idx + 1,
        description: it.description || it.desc || 'Service / Good Item',
        deliverables: Array.isArray(it.deliverables) ? it.deliverables : (it.deliverables ? [String(it.deliverables)] : []),
        hsn: it.hsn || '998365',
        qty,
        unit: it.unit || 'NOS',
        unitPrice,
        discount,
        taxableAmount: lineTaxable,
        gstRate,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalAmount,
      };
    });

    const finalSubtotal = Number(subtotal.toFixed(2));
    const finalTotalDiscount = Number(totalDiscount.toFixed(2));
    const finalTaxable = Number(taxableAmount.toFixed(2));
    const finalCgst = Number(cgstTotal.toFixed(2));
    const finalSgst = Number(sgstTotal.toFixed(2));
    const finalIgst = Number(igstTotal.toFixed(2));
    const grandTotal = Number((finalTaxable + finalCgst + finalSgst + finalIgst).toFixed(2));
    const amountInWords = numberToIndianWords(grandTotal);

    const createdPO = await prisma.purchaseOrder.create({
      data: {
        poNumber: finalPONumber,
        orderDate,
        expectedDeliveryDate: expectedDeliveryDate || null,
        paymentTerms,
        poValidity,
        projectRefNo: projectRefNo || null,
        deliveryTerms,
        modeOfTransport,
        remarks: remarks || null,
        status,
        vendorId,
        vendorName: vendorName.trim(),
        vendorAddress: vendorAddress?.trim() || null,
        vendorGstin: vendorGstin?.trim() ? vendorGstin.trim().toUpperCase() : null,
        vendorEmail: vendorEmail?.trim() || null,
        vendorPhone: vendorPhone?.trim() || null,
        buyerName,
        buyerAddress,
        buyerGstin,
        buyerPhone,
        buyerEmail,
        itemsJson: JSON.stringify(computedItems),
        isInterState,
        subtotal: finalSubtotal,
        totalDiscount: finalTotalDiscount,
        taxableAmount: finalTaxable,
        cgstTotal: finalCgst,
        sgstTotal: finalSgst,
        igstTotal: finalIgst,
        grandTotal,
        amountInWords,
        showBankDetails: Boolean(showBankDetails),
        bankDetailsJson: bankDetailsJson ? JSON.stringify(bankDetailsJson) : null,
        terms: terms || DEFAULT_PO_TERMS,
        signatoryName,
        signatoryCompany,
        signatureUrl,
        notes: notes || null,
        createdById,
        createdByName,
      },
    });

    return NextResponse.json(createdPO, { status: 201 });
  } catch (error: any) {
    console.error('[Purchase Orders POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

