import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/db';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const previewSrc = product.previewImageUrl || product.cutoutImageUrl || product.originalImageUrl;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-ink-muted hover:text-ink-primary transition-quart text-[13px]">
          ← المنتجات
        </Link>
        <span className="text-ink-muted">/</span>
        <h1 className="text-[20px] font-black text-ink-primary">
          تعديل: {product.nameAr || product.name}
        </h1>
      </div>

      {/* Preview images status */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'الصورة الأصلية', src: product.originalImageUrl },
          { label: 'بدون خلفية', src: product.cutoutImageUrl },
          { label: 'المعاينة النهائية', src: product.previewImageUrl },
        ].map(({ label, src }) => (
          <div key={label} className="bg-surface border border-subtle rounded-2xl p-3">
            <div className="relative w-full h-24 mb-2">
              {src ? (
                <Image src={src} alt={label} fill className="object-contain" sizes="33vw" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl opacity-15">📷</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-center font-semibold
              ${src ? 'text-green' : 'text-ink-muted'}">
              {src ? '✓ ' : '○ '}{label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-subtle rounded-3xl p-6">
        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  );
}
