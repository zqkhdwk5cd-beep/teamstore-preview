import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct } from '@/lib/db';
import { IPHONE_MODELS } from '@/types';
import { processProductImages } from '@/lib/imageProcessor';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!product.originalImageUrl) return NextResponse.json({ error: 'No original image' }, { status: 400 });

  const originalPath = path.join(process.cwd(), 'public', product.originalImageUrl);
  if (!existsSync(originalPath)) return NextResponse.json({ error: 'Original image file missing' }, { status: 400 });

  try {
    const series = IPHONE_MODELS[product.model].series;
    const { cutoutUrl, previewUrl } = await processProductImages(originalPath, id, series);
    const updated = updateProduct(id, { cutoutImageUrl: cutoutUrl, previewImageUrl: previewUrl });
    return NextResponse.json({ product: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
