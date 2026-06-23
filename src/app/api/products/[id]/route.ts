import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';
import { IPhoneModel, IPHONE_MODELS } from '@/types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { processProductImages } from '@/lib/imageProcessor';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getProductById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const formData = await req.formData();
    const updates: Record<string, unknown> = {};

    ['barcode','name','nameAr','color','colorAr'].forEach(field => {
      const v = formData.get(field);
      if (v !== null) updates[field] = v as string;
    });

    const price = formData.get('price');
    if (price) updates.price = parseFloat(price as string);

    const stock = formData.get('stock');
    if (stock) updates.stock = parseInt(stock as string, 10);

    const model = formData.get('model') as IPhoneModel | null;
    if (model && IPHONE_MODELS[model]) updates.model = model;

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'originals');
      if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

      const ext = imageFile.name.split('.').pop() || 'jpg';
      const filename = `${id}_${Date.now()}_original.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      const bytes = await imageFile.arrayBuffer();
      await writeFile(filepath, Buffer.from(bytes));

      updates.originalImageUrl = `/uploads/originals/${filename}`;
      const series = IPHONE_MODELS[(updates.model as IPhoneModel) || existing.model].series;

      try {
        const { cutoutUrl, previewUrl } = await processProductImages(filepath, id, series);
        updates.cutoutImageUrl = cutoutUrl;
        updates.previewImageUrl = previewUrl;
      } catch (e) {
        console.warn('Image processing failed:', e);
      }
    }

    const updated = updateProduct(id, updates as Parameters<typeof updateProduct>[1]);
    return NextResponse.json({ product: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = deleteProduct(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
