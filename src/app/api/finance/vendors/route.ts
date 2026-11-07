import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureSeedData();
    const vendors = await prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(vendors, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[Vendors GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();

    const {
      name,
      contactPerson = '',
      email = '',
      phone = '',
      gstin = '',
      address = '',
      city = '',
      state = '',
      pincode = '',
      category = 'SERVICE',
      notes = '',
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Vendor name is required.' }, { status: 400 });
    }

    const created = await prisma.vendor.create({
      data: {
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        gstin: gstin?.trim() ? gstin.trim().toUpperCase() : null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        pincode: pincode?.trim() || null,
        category: category || 'SERVICE',
        notes: notes?.trim() || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[Vendors POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

