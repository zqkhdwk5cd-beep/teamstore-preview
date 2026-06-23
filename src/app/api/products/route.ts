import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct, getProductByBarcode } from '@/lib/db';
import { IPhoneModel, IPHONE_MODELS } from '@/types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { processProductImages } from '@/lib/imageProcessor';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get('barcode');

    if (barcode) {
      const product = getProductByBarcode(barcode);
      if (!product) {
        return NextResponse.json({ found: false, error: 'المنتج غير موجود' }, { status: 404 });
      }
      return NextResponse.json({ found: true, product });
    }

    const products = getAllProducts();
    return NextResponse.json({ products });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const barcode   = formData.get('barcode') as string;
    const name      = formData.get('name') as string;
    const nameAr    = formData.get('nameAr') as string;
    const model     = formData.get('model') as IPhoneModel;
    const color     = formData.get('color') as string;
    const colorAr   = formData.get('colorAr') as string;
    const price     = parseFloat(formData.get('price') as string);
    const stock     = parseInt(formData.get('stock') as string, 10);
    const imageFile = formData.get('image') as File | null;

    if (!barcode || !name || !model || !price) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    // Validate model
    if (!IPHONE_MODELS[model]) {
      return NextResponse.json({ error: 'موديل غير صحيح' }, { status: 400 });
    }

    const tempId = Date.now().toString(36);
    let originalImageUrl: string | null = null;
    let cutoutImageUrl: string | null = null;
    let previewImageUrl: string | null = null;

    // Handle image upload & processing
    if (imageFile && imageFile.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'originals');
      if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

      const ext = imageFile.name.split('.').pop() || 'jpg';
      const filename = `${tempId}_original.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      const bytes = await imageFile.arrayBuffer();
      await writeFile(filepath, Buffer.from(bytes));

      originalImageUrl = `/uploads/originals/${filename}`;

      // Determine series from model
      const series = IPHONE_MODELS[model].series;

      try {
        const { cutoutUrl, previewUrl } = await processProductImages(filepath, tempId, series);
        cutoutImageUrl  = cutoutUrl;
        previewImageUrl = previewUrl;
      } catch (imgError) {
        console.warn('Image processing failed, continuing without preview:', imgError);
        originalImageUrl = `/uploads/originals/${filename}`;
      }
    }

    const product = createProduct({
      barcode,
      name,
      nameAr: nameAr || name,
      model,
      color: color || '',
      colorAr: colorAr || color || '',
      price,
      stock: isNaN(stock) ? 0 : stock,
      originalImageUrl,
      cutoutImageUrl,
      previewImageUrl,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
