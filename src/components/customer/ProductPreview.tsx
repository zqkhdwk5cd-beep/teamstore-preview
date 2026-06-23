'use client';

import Image from 'next/image';
import { Product, IPhoneModel, IPHONE_MODELS } from '@/types';
import { useState } from 'react';

interface Props {
  product: Product;
  model: IPhoneModel;
  onScanAnother: () => void;
  onChangeModel: () => void;
}

export default function ProductPreview({ product, model, onScanAnother, onChangeModel }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const previewSrc = product.previewImageUrl || product.cutoutImageUrl || product.originalImageUrl;
  const modelMeta = IPHONE_MODELS[model];
  const inStock = product.stock > 0;

  return (
    <div className="flex flex-col pb-6">

      {/* Back nav */}
      <div className="px-4 pt-2">
        <button
          onClick={onScanAnother}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted py-3 -mx-1 px-1"
        >
          ← امسح جراب تاني
        </button>
      </div>

      {/* Preview image — full bleed, cinematic */}
      <div className="relative w-full bg-deep overflow-hidden"
        style={{ minHeight: '62vw', maxHeight: '72vw' }}>

        {/* Radial glow behind image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2/3 h-2/3 rounded-full blur-3xl opacity-30"
            style={{ background: `radial-gradient(circle, var(--color-accent) 0%, transparent 70%)` }} />
        </div>

        {/* Skeleton */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Preview image */}
        {previewSrc && !imgError ? (
          <Image
            src={previewSrc}
            alt={product.nameAr || product.name}
            fill
            className={`object-contain transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            priority
            sizes="100vw"
          />
        ) : (
          /* Fallback placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-36 bg-surface rounded-2xl border border-subtle
              flex items-center justify-center text-4xl opacity-40">📱</div>
            <span className="text-[12px] text-ink-muted">معاينة غير متاحة</span>
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full
            text-[11px] font-semibold backdrop-blur-sm
            ${inStock
              ? 'bg-green/10 border border-green/30 text-green'
              : 'bg-red/10 border border-red/30 text-red'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green' : 'bg-red'}`} />
            {inStock ? 'متوفر' : 'نفد المخزون'}
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="px-4 pt-5 flex flex-col gap-4 animate-fade-in">

        {/* Name + price row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-[20px] font-black text-ink-primary leading-tight"
              style={{ textWrap: 'balance' }}>
              {product.nameAr || product.name}
            </h1>
            <div className="text-[12px] text-ink-muted mt-1">كود: {product.barcode}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[24px] font-black text-gold leading-none">
              {product.price.toLocaleString('ar-EG')}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">جنيه مصري</div>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex flex-col gap-2">
          <div className="chip">
            <div className="chip-icon">📱</div>
            <div>
              <div className="text-[10px] text-ink-muted">متوافق مع</div>
              <div className="text-[13px] font-bold text-ink-primary">{modelMeta.nameAr}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="chip">
              <div className="chip-icon">🎨</div>
              <div>
                <div className="text-[10px] text-ink-muted">اللون</div>
                <div className="text-[13px] font-bold text-ink-primary">
                  {product.colorAr || product.color || '—'}
                </div>
              </div>
            </div>
            <div className="chip">
              <div className="chip-icon">📦</div>
              <div>
                <div className="text-[10px] text-ink-muted">المخزون</div>
                <div className={`text-[13px] font-bold ${inStock ? 'text-green' : 'text-red'}`}>
                  {inStock ? `${product.stock} قطعة` : 'نفد'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 pb-safe">
          {inStock && (
            <button className="btn-gold">
              🛒 أضف للسلة
            </button>
          )}
          <button
            onClick={onScanAnother}
            className="btn-ghost justify-center"
          >
            📷 امسح جراب تاني
          </button>
          <button
            onClick={onChangeModel}
            className="text-center text-[12px] text-ink-muted py-2"
          >
            تغيير الموديل
          </button>
        </div>
      </div>
    </div>
  );
}
