import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { formatINR } from '@/lib/invoice-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const po = await prisma.purchaseOrder.findFirst({
      where: { OR: [{ id }, { poNumber: id }] },
    });

    if (!po) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    const recipientEmail = body.toEmail || po.vendorEmail;
    if (!recipientEmail) {
      return NextResponse.json({ error: 'Vendor email address is required' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER || 'harshitsingh19622@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'gbvqcaojszvhuvei';
    const emailFrom = `"CodeKaps Procurement" <${smtpUser}>`;

    let items: any[] = [];
    try {
      items = JSON.parse(po.itemsJson || '[]');
    } catch {}

    const itemsRowsHtml = items
      .map(
        (it) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-size: 13px; color: #1e293b;">
            <strong>${it.description}</strong>
            ${
              it.deliverables && it.deliverables.length > 0
                ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">${it.deliverables.join('<br>')}</div>`
                : ''
            }
          </td>
          <td style="padding: 10px 12px; font-size: 13px; text-align: center; color: #475569;">${it.hsn || '-'}</td>
          <td style="padding: 10px 12px; font-size: 13px; text-align: center; color: #475569;">${it.qty}</td>
          <td style="padding: 10px 12px; font-size: 13px; text-align: right; color: #475569;">₹${it.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px 12px; font-size: 13px; text-align: right; color: #475569;">${it.gstRate}%</td>
          <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: bold; color: #0f172a;">₹${it.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #004B35; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="color: #004B35; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED</h2>
            <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">GSTIN: 03AAMCC6345B1Z0 | Phone: 7528835379 | info@codekap.in</p>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; background-color: #F5C324; color: #004B35; font-weight: 900; font-size: 12px; padding: 6px 14px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">PURCHASE ORDER</span>
          </div>
        </div>

        <p style="font-size: 14px; color: #334155; margin-bottom: 18px;">
          Dear <strong>${po.vendorName}</strong>,
        </p>
        <p style="font-size: 14px; color: #334155; margin-bottom: 20px; line-height: 1.5;">
          Please find below the official Purchase Order <strong>${po.poNumber}</strong> issued by <strong>CodeKaps Digital Innovations Pvt. Ltd.</strong>
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div>
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold;">PO Number:</span>
            <div style="font-weight: 800; color: #004B35;">${po.poNumber}</div>
          </div>
          <div>
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold;">Order Date:</span>
            <div style="font-weight: 600;">${po.orderDate}</div>
          </div>
          <div>
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold;">Expected Delivery:</span>
            <div style="font-weight: 600;">${po.expectedDeliveryDate || 'As agreed'}</div>
          </div>
          <div>
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold;">Payment Terms:</span>
            <div style="font-weight: 600;">${po.paymentTerms || 'Net 15 Days'}</div>
          </div>
        </div>

        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #0f172a;">Itemized Order Breakdown:</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #F5C324; color: #0f172a; font-size: 12px;">
              <th style="padding: 8px 12px; text-align: left;">Item Description</th>
              <th style="padding: 8px 12px; text-align: center;">HSN</th>
              <th style="padding: 8px 12px; text-align: center;">Qty</th>
              <th style="padding: 8px 12px; text-align: right;">Rate</th>
              <th style="padding: 8px 12px; text-align: right;">GST</th>
              <th style="padding: 8px 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
            <span style="color: #64748b;">Taxable Subtotal:</span>
            <span style="font-weight: 600;">₹${po.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          ${
            po.isInterState
              ? `<div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">IGST Total:</span>
                  <span style="font-weight: 600;">₹${po.igstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>`
              : `<div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">CGST + SGST:</span>
                  <span style="font-weight: 600;">₹${(po.cgstTotal + po.sgstTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>`
          }
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #004B35; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 6px;">
            <span>Grand Total:</span>
            <span>₹${po.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <p style="font-size: 11px; color: #475569; font-style: italic; margin: 8px 0 0 0;">
            Amount in words: ${po.amountInWords || ''}
          </p>
        </div>

        ${
          po.remarks
            ? `<div style="margin-bottom: 20px; font-size: 12px; color: #334155; background: #fffbeb; padding: 10px 14px; border-radius: 8px; border-left: 4px solid #F5C324;">
                <strong>Remarks:</strong> ${po.remarks}
              </div>`
            : ''
        }

        <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="font-size: 12px; color: #64748b; margin: 0;">CodeKaps Procurement Desk</p>
            <p style="font-size: 12px; font-weight: 700; color: #004B35; margin: 2px 0 0 0;">Your Vision. Our Code.</p>
            <a href="https://www.codekap.in" style="font-size: 11px; color: #2563eb; text-decoration: none;">www.codekap.in</a>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">For, CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED</p>
            <p style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 0;">Authorized Signatory</p>
          </div>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: emailFrom,
      to: recipientEmail,
      subject: `Official Purchase Order: ${po.poNumber} — CodeKaps Digital Innovations Pvt. Ltd.`,
      html: htmlContent,
    });

    // Update PO status to ISSUED if it was DRAFT
    if (po.status === 'DRAFT') {
      await prisma.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'ISSUED' },
      });
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      deliveredTo: recipientEmail,
    });
  } catch (error: any) {
    console.error('[PO Email Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}

