'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { IPhoneModel, IPHONE_MODELS, Product } from '@/types';

interface Props {
  selectedModel: IPhoneModel;
  onSuccess: (product: Product) => void;
  onBack: () => void;
}

type ScanState = 'initializing' | 'scanning' | 'found' | 'not-found' | 'error';

export default function Scanner({ selectedModel, onSuccess, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<unknown>(null);
  const [state, setState] = useState<ScanState>('initializing');
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scanning, setScanning] = useState(false);

  const processCode = useCallback(async (barcode: string) => {
    if (scanning) return;
    setScanning(true);
    setState('found');

    try {
      const res = await fetch(`/api/products?barcode=${encodeURIComponent(barcode.trim())}`);
      const data = await res.json();

      if (data.found && data.product) {
        onSuccess(data.product);
      } else {
        setState('not-found');
        setErrorMsg(data.error || `الكود "${barcode}" غير موجود في النظام`);
        setTimeout(() => { setState('scanning'); setScanning(false); }, 2500);
      }
    } catch {
      setState('error');
      setErrorMsg('خطأ في الاتصال — تأكد من الإنترنت');
      setTimeout(() => { setState('scanning'); setScanning(false); }, 2500);
    }
  }, [scanning, onSuccess]);

  useEffect(() => {
    let active = true;

    async function initScanner() {
      try {
        const ZXing = (await import('@zxing/library')).BrowserMultiFormatReader;
        if (!active) return;

        const reader = new ZXing();
        scannerRef.current = reader;

        await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result) => {
            if (result && active && !scanning) {
              processCode(result.getText());
            }
          }
        );

        if (active) setState('scanning');
      } catch (err) {
        console.error('Scanner init error:', err);
        if (active) {
          setState('error');
          setErrorMsg('تعذّر تشغيل الكاميرا — استخدم الإدخال اليدوي');
        }
      }
    }

    initScanner();

    return () => {
      active = false;
      if (scannerRef.current) {
        (scannerRef.current as { reset: () => void }).reset();
      }
    };
  }, [processCode, scanning]);

  const handleManual = () => {
    if (manualCode.trim()) processCode(manualCode.trim());
  };

  return (
    <div className="flex flex-col px-4 pb-6 pt-2 gap-4">

      {/* Back + title */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted py-3 -mx-1 px-1"
        >
          <span>←</span> رجوع
        </button>

        <div className="text-center pb-1">
          <div className="pill mb-2">📷 الخطوة الثانية</div>
          <h2 className="text-[20px] font-black text-ink-primary mb-1">سكان باركود الجراب</h2>
          <p className="text-[12px] text-ink-secondary">
            وجّه الكاميرا على الباركود الموجود على المنتج
          </p>
        </div>
      </div>

      {/* Selected model badge */}
      <div className="flex items-center justify-center gap-2 bg-surface border border-subtle
        rounded-2xl py-2.5 px-4">
        <span className="text-[13px] text-ink-muted">الموديل المختار:</span>
        <span className="text-[13px] font-bold text-accent">{IPHONE_MODELS[selectedModel].nameAr}</span>
      </div>

      {/* Camera viewfinder */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[#000]
        shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Scan frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[58%] aspect-square">
            {/* Corners */}
            {['top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
              'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
              'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
              'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-5 h-5 border-accent ${cls}`} />
            ))}
            {/* Scan beam */}
            {state === 'scanning' && (
              <div className="absolute left-[8%] right-[8%] h-[1.5px] bg-gradient-to-r
                from-transparent via-accent to-transparent animate-scan-line" />
            )}
          </div>
        </div>

        {/* Status overlays */}
        {state === 'initializing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-surface border-t-accent rounded-full animate-spin" />
              <span className="text-[12px] text-ink-secondary">جاري تشغيل الكاميرا...</span>
            </div>
          </div>
        )}

        {state === 'found' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-accent/20 border border-accent rounded-full
                flex items-center justify-center animate-pulse-ring">
                <span className="text-accent text-2xl">✓</span>
              </div>
              <span className="text-[12px] text-accent font-semibold">تم التعرف...</span>
            </div>
          </div>
        )}

        {(state === 'not-found' || state === 'error') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <span className="text-red text-3xl">⚠</span>
              <span className="text-[12px] text-red">{errorMsg}</span>
            </div>
          </div>
        )}
      </div>

      {state === 'scanning' && (
        <p className="text-center text-[12px] text-ink-muted -mt-1">
          بيتعرف تلقائياً — مش محتاج تضغط حاجة
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-[11px] text-ink-muted">أو ادخل الكود يدوياً</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      {/* Manual input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={e => setManualCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleManual()}
          placeholder="مثال: 1 أو ABC123"
          dir="ltr"
          className="flex-1 bg-surface border border-subtle rounded-xl px-4 py-3
            text-[14px] text-ink-primary placeholder:text-ink-muted outline-none
            focus:border-accent/50 transition-quart"
        />
        <button
          onClick={handleManual}
          disabled={!manualCode.trim()}
          className="bg-accent rounded-xl px-5 py-3 text-[14px] font-bold text-white
            disabled:opacity-40 active:scale-95 transition-quart"
        >
          بحث
        </button>
      </div>

      {state === 'error' && (
        <p className="text-center text-[11px] text-red">{errorMsg}</p>
      )}
    </div>
  );
}
