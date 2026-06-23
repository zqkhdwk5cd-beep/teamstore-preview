'use client';

import { IPhoneModel, IPHONE_MODELS } from '@/types';
import { useState } from 'react';

interface Props {
  selected: IPhoneModel | null;
  onSelect: (model: IPhoneModel) => void;
  onConfirm: () => void;
}

type Series = 'standard' | 'pro' | 'plus';
const SERIES_LABELS: Record<Series, string> = {
  standard: 'Standard',
  pro: 'Pro',
  plus: 'Plus / Max',
};

// Group models by series
const MODEL_GROUPS = Object.entries(IPHONE_MODELS).reduce<Record<Series, Array<[IPhoneModel, typeof IPHONE_MODELS[IPhoneModel]]>>>
((acc, [id, meta]) => {
  const s = meta.series as Series;
  if (!acc[s]) acc[s] = [];
  acc[s].push([id as IPhoneModel, meta]);
  return acc;
}, { standard: [], pro: [], plus: [] });

function PhoneThumb({ model }: { model: IPhoneModel }) {
  const isPro = IPHONE_MODELS[model].series === 'pro';
  const isPlus = IPHONE_MODELS[model].series === 'plus';

  return (
    <svg width="28" height="48" viewBox="0 0 28 48" fill="none" className="opacity-80">
      <rect x="1" y="1" width="26" height="46" rx="6" fill="#181830" stroke="#363660" strokeWidth="1.5"/>
      <rect x="2.5" y="2.5" width="23" height="43" rx="5" fill="#0c0c1a"/>
      {/* Dynamic Island */}
      <rect x="9" y="4" width="10" height="3.5" rx="1.75" fill="#000"/>
      {/* Camera */}
      {isPro ? (
        <>
          <rect x="17" y="6.5" width="8" height="8" rx="2" fill="#0c0c1a" stroke="#252540" strokeWidth="0.6"/>
          <circle cx="19.5" cy="8.5" r="1.4" fill="#070710"/>
          <circle cx="23" cy="8.5" r="1.4" fill="#070710"/>
          <circle cx="19.5" cy="12" r="1.4" fill="#070710"/>
        </>
      ) : (
        <>
          <rect x="17.5" y="7" width="7" height="4.5" rx="1.5" fill="#0c0c1a" stroke="#252540" strokeWidth="0.6"/>
          <circle cx="20" cy="9.25" r="1.4" fill="#070710"/>
          <circle cx="23" cy="9.25" r="1.4" fill="#070710"/>
        </>
      )}
      <rect x="27" y="14" width="2" height="10" rx="1" fill="#2a2a44"/>
    </svg>
  );
}

export default function ModelSelector({ selected, onSelect, onConfirm }: Props) {
  const [activeSeries, setActiveSeries] = useState<Series>('standard');

  return (
    <div className="flex flex-col px-4 pb-6 pt-2 gap-5">

      {/* Hero */}
      <div className="text-center pt-4 pb-2">
        <div className="pill mb-3">🎯 الخطوة الأولى</div>
        <h1 className="text-[24px] font-black text-ink-primary leading-tight mb-2"
          style={{ textWrap: 'balance' }}>
          إيه موديل آيفونك؟
        </h1>
        <p className="text-[13px] text-ink-secondary leading-relaxed">
          اختار موديلك عشان نعرض الجراب عليه بشكل حقيقي
        </p>
      </div>

      {/* Series tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {(Object.keys(SERIES_LABELS) as Series[]).map(s => (
          <button
            key={s}
            onClick={() => setActiveSeries(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-600 transition-quart border
              ${activeSeries === s
                ? 'bg-accent-dim border-accent/30 text-accent'
                : 'bg-surface border-subtle text-ink-secondary'}`}
          >
            {SERIES_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Model grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {MODEL_GROUPS[activeSeries].map(([id, meta]) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-right
                transition-expo -webkit-tap-highlight-color-transparent
                ${isSelected
                  ? 'bg-accent-dim border-accent shadow-[0_0_0_1px_rgba(124,111,255,0.3),0_6px_20px_rgba(124,111,255,0.12)]'
                  : 'bg-surface border-subtle active:scale-95'}`}
            >
              <PhoneThumb model={id} />
              <div>
                <div className="text-[12px] font-bold text-ink-primary leading-tight">
                  {meta.nameAr.replace('آيفون ', '')}
                </div>
                <div className="text-[10px] text-ink-muted mt-0.5">{meta.name.split(' ').slice(-1)[0]}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm CTA */}
      <div className="sticky bottom-0 pt-3 pb-safe">
        <button
          className="btn-primary"
          disabled={!selected}
          onClick={onConfirm}
        >
          {selected
            ? `تم — امسح الجراب ←`
            : 'اختار موديلك الأول'}
        </button>
        {selected && (
          <p className="text-center text-[11px] text-ink-muted mt-2">
            {IPHONE_MODELS[selected].nameAr} مختار
          </p>
        )}
      </div>
    </div>
  );
}
