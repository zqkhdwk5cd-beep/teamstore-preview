'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IPhoneModel, IPHONE_MODELS, Product } from '@/types';

interface Props {
  product?: Product;
  mode: 'add' | 'edit';
}

type Series = 'standard' | 'pro' | 'plus';

const SERIES_LABELS: Record<Series, string> = {
  standard: 'Standard (11–16)',
  pro: 'Pro / Pro Max',
  plus: 'Plus / Max',
};

export default function ProductForm({ product, mode }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<string | null>(
    product?.previewImageUrl || product?.originalImageUrl || null
  );
  const [selectedSeries, setSelectedSeries] = useState<Series>(
    product ? (IPHONE_MODELS[product.model]?.series as Series) : 'standard'
  );

  const [form, setForm] = useState({
    barcode:  product?.barcode  || '',
    name:     product?.name     || '',
    nameAr:   product?.nameAr   || '',
    model:    product?.model    || '' as IPhoneModel | '',
    color:    product?.color    || '',
    colorAr:  product?.colorAr  || '',
    price:    product?.price    || '',
    stock:    product?.stock    ?? '',
  });

  const modelsBySeriesGroup = Object.entries(IPHONE_MODELS)
    .filter(([, meta]) => meta.series === selectedSeries)
    .map(([id, meta]) => ({ id: id as IPhoneModel, ...meta }));

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.barcode || !form.name || !form.model || !form.price) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

      const file = fileRef.current?.files?.[0];
      if (file) fd.append('image', file);

      const url = mode === 'add' ? '/api/products' : `/api/products/${product!.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'حدث خطأ');
        return;
      }

      setSuccess(mode === 'add' ? 'تم إضافة المنتج بنجاح! ✓' : 'تم الحفظ بنجاح! ✓');
      if (mode === 'add') {
        setTimeout(() => router.push('/admin'), 1200);
      }
    } catch {
      setError('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `w-full bg-surface border border-subtle rounded-xl px-4 py-3
    text-[14px] text-ink-primary placeholder:text-ink-muted outline-none
    focus:border-accent/50 transition-quart`;

  const labelCls = `block text-[12px] font-semibold text-ink-secondary mb-1.5`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Image upload */}
      <div>
        <div className={labelCls}>صورة الجراب *</div>
        <div
          className="relative w-full h-48 rounded-2xl border-2 border-dashed border-subtle
            bg-surface cursor-pointer overflow-hidden flex items-center justify-center
            hover:border-accent/40 transition-quart"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <Image src={preview} alt="preview" fill className="object-contain" sizes="100%" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-ink-muted">
              <span className="text-4xl opacity-30">📷</span>
              <span className="text-[13px]">اضغط لرفع صورة الجراب</span>
              <span className="text-[11px] opacity-60">PNG أو JPG — خلفية بيضاء مثالية</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2">
            <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              {preview ? 'تغيير' : 'رفع'}
            </span>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-[11px] text-ink-muted mt-1.5">
          سيتم إزالة الخلفية تلقائياً وتوليد صورة المعاينة
        </p>
      </div>

      {/* Barcode */}
      <div>
        <label className={labelCls}>الباركود *</label>
        <input
          type="text"
          value={form.barcode}
          onChange={set('barcode')}
          placeholder="مثال: 1 أو ABC123"
          dir="ltr"
          className={inputCls}
          required
        />
      </div>

      {/* Names row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>اسم المنتج (عربي) *</label>
          <input type="text" value={form.nameAr} onChange={set('nameAr')}
            placeholder="جراب سيليكون أزرق" className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Product Name (EN) *</label>
          <input type="text" value={form.name} onChange={set('name')}
            placeholder="Blue Silicone Case" dir="ltr" className={inputCls} required />
        </div>
      </div>

      {/* Model */}
      <div>
        <label className={labelCls}>موديل الآيفون *</label>

        {/* Series tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none pb-1">
          {(Object.keys(SERIES_LABELS) as Series[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { setSelectedSeries(s); setForm(f => ({ ...f, model: '' })); }}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border
                transition-quart
                ${selectedSeries === s
                  ? 'bg-accent-dim border-accent/30 text-accent'
                  : 'bg-surface border-subtle text-ink-muted'}`}
            >
              {SERIES_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {modelsBySeriesGroup.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, model: m.id }))}
              className={`text-right p-3 rounded-xl border text-[12px] transition-quart
                ${form.model === m.id
                  ? 'bg-accent-dim border-accent text-accent font-semibold'
                  : 'bg-surface border-subtle text-ink-secondary hover:border-accent/30'}`}
            >
              {m.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Color row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>اللون (عربي)</label>
          <input type="text" value={form.colorAr} onChange={set('colorAr')}
            placeholder="أزرق" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Color (EN)</label>
          <input type="text" value={form.color} onChange={set('color')}
            placeholder="Blue" dir="ltr" className={inputCls} />
        </div>
      </div>

      {/* Price + Stock row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>السعر (جنيه) *</label>
          <input type="number" value={form.price} onChange={set('price')}
            placeholder="149" dir="ltr" min="0" step="0.01"
            className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>المخزون (قطع)</label>
          <input type="number" value={form.stock} onChange={set('stock')}
            placeholder="10" dir="ltr" min="0"
            className={inputCls} />
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="bg-red/10 border border-red/20 rounded-xl px-4 py-3
          text-[13px] text-red">
          ⚠ {error}
        </div>
      )}
      {success && (
        <div className="bg-green/10 border border-green/20 rounded-xl px-4 py-3
          text-[13px] text-green">
          {success}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="btn-primary"
      >
        {saving
          ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جاري المعالجة...
            </span>
          )
          : mode === 'add' ? '✓ إضافة المنتج' : '✓ حفظ التعديلات'
        }
      </button>
    </form>
  );
}
