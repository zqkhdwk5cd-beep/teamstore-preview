import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';

export default function AddProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-ink-muted hover:text-ink-primary transition-quart text-[13px]">
          ← المنتجات
        </Link>
        <span className="text-ink-muted">/</span>
        <h1 className="text-[20px] font-black text-ink-primary">إضافة منتج جديد</h1>
      </div>

      <div className="bg-surface border border-subtle rounded-3xl p-6">
        <ProductForm mode="add" />
      </div>
    </div>
  );
}
