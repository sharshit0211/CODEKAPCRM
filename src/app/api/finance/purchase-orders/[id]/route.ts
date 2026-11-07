import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';
import { numberToIndianWords } from '@/lib/invoice-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeedData();
    const { id } = await params;

    const po = await prisma.purchaseOrder.findFirst({
      where: {
        OR: [{ id }, { poNumber: id }],
      },
    });

    if (!po) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    return NextResponse.json(po);
  } catch (error: any) {
    console.error('[PO GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeedData();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.purchaseOrder.findFirst({
      where: { OR: [{ id }, { poNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    // If items or isInterState are provided, recalculate totals
    let updatedData: any = { ...body };

    if (body.items) {
      const isInterState = body.isInterState !== undefined ? body.isInterState : existing.isInterState;
      let subtotal = 0;
      let totalDiscount = 0;
      let taxableAmount = 0;
      let cgstTotal = 0;
      let sgstTotal = 0;
      let igstTotal = 0;

      const computedItems = body.items.map((it: any, idx: number) => {
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
          description: it.description || it.desc || 'Service Item',
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

      updatedData = {
        ...updatedData,
        itemsJson: JSON.stringify(computedItems),
        subtotal: finalSubtotal,
        totalDiscount: finalTotalDiscount,
        taxableAmount: finalTaxable,
        cgstTotal: finalCgst,
        sgstTotal: finalSgst,
        igstTotal: finalIgst,
        grandTotal,
        amountInWords,
      };
      delete updatedData.items;
    }

    if (body.bankDetailsJson && typeof body.bankDetailsJson === 'object') {
      updatedData.bankDetailsJson = JSON.stringify(body.bankDetailsJson);
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: existing.id },
      data: updatedData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PO PATCH Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeedData();
    const { id } = await params;

    const existing = await prisma.purchaseOrder.findFirst({
      where: { OR: [{ id }, { poNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    await prisma.purchaseOrder.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: 'Purchase Order deleted successfully' });
  } catch (error: any) {
    console.error('[PO DELETE Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

