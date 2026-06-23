import { getAllProducts } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { IPHONE_MODELS } from '@/types';
import DeleteButton from '@/components/admin/DeleteButton';
import ReprocessButton from '@/components/admin/ReprocessButton';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const products = getAllProducts();

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-black text-ink-primary">المنتجات</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">{products.length} منتج مسجل</p>
        </div>
        <Link href="/admin/add"
          className="flex items-center gap-2 bg-accent rounded-xl px-4 py-2.5
            text-[13px] font-bold text-white active:scale-95 transition-quart">
          + إضافة منتج
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="text-6xl opacity-20">📦</div>
          <div>
            <p className="text-[16px] font-bold text-ink-primary">لا يوجد منتجات بعد</p>
            <p className="text-[13px] text-ink-muted mt-1">ابدأ بإضافة أول منتج من الزرار أعلاه</p>
          </div>
          <Link href="/admin/add" className="btn-primary max-w-[200px]">إضافة منتج</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-subtle">
          <table className="w-full">
            <thead>
              <tr className="border-b border-subtle bg-surface text-right">
                <th className="px-4 py-3 text-[11px] font-semibold text-ink-muted">المعاينة</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-ink-muted">المنتج</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-ink-muted hidden md:table-cell">الموديل</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-ink-muted">السعر</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-ink-muted hidden sm:table-cell">المخزون</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-ink-muted">الحالة</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-ink-muted">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const previewSrc = p.previewImageUrl || p.cutoutImageUrl || p.originalImageUrl;
                const inStock = p.stock > 0;
                return (
                  <tr key={p.id}
                    className={`border-b border-subtle last:border-0 hover:bg-surface/50 transition-quart
                      ${i % 2 === 0 ? 'bg-void' : 'bg-deep'}`}>

                    {/* Preview thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-16 bg-surface rounded-lg overflow-hidden border border-subtle
                        flex items-center justify-center relative">
                        {previewSrc ? (
                          <Image src={previewSrc} alt={p.name} fill className="object-contain" sizes="48px" />
                        ) : (
                          <span className="text-2xl opacity-20">📱</span>
                        )}
                      </div>
                    </td>

                    {/* Product info */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[13px] text-ink-primary leading-tight">
                        {p.nameAr || p.name}
                      </div>
                      <div className="text-[11px] text-ink-muted font-mono mt-0.5">{p.barcode}</div>
                      <div className="text-[11px] text-ink-secondary mt-0.5">{p.colorAr || p.color}</div>
                    </td>

                    {/* Model */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[12px] text-ink-secondary">
                        {IPHONE_MODELS[p.model]?.nameAr || p.model}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-[14px] font-bold text-gold">
                        {p.price.toLocaleString('ar-EG')}
                      </span>
                      <span className="text-[10px] text-ink-muted mr-1">ج</span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-[12px] font-semibold ${inStock ? 'text-green' : 'text-red'}`}>
                        {p.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5
                          rounded-full w-fit ${inStock
                            ? 'bg-green/10 text-green'
                            : 'bg-red/10 text-red'}`}>
                          {inStock ? '● متوفر' : '● نفد'}
                        </span>
                        {!p.previewImageUrl && (
                          <span className="text-[10px] text-gold/70">⚠ بدون معاينة</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/edit/${p.id}`}
                          className="text-[11px] text-accent hover:underline">تعديل</Link>
                        {!p.previewImageUrl && p.originalImageUrl && (
                          <ReprocessButton productId={p.id} />
                        )}
                        <DeleteButton productId={p.id} productName={p.nameAr || p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
