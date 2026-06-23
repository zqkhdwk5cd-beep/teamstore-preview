'use client';

import { useEffect, useState } from 'react';

export default function InAppBrowserWall() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isInApp =
      /Instagram|FBAN|FBAV|Twitter|TikTok|Snapchat|WhatsApp|Line\//.test(ua) ||
      (/iPhone|iPad/.test(ua) && !/Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua));
    setShow(isInApp);
  }, []);

  if (!show) return null;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] ambient-bg flex flex-col items-center justify-center
      px-6 gap-5 text-center">

      <div className="text-5xl">🔒</div>

      <div>
        <h1 className="text-[22px] font-black text-ink-primary leading-snug mb-2">
          افتح في Safari<br />عشان الكاميرا تشتغل
        </h1>
        <p className="text-[13px] text-ink-secondary leading-relaxed max-w-[280px] mx-auto">
          الكاميرا مش بتشتغل جوه تطبيقات زي Instagram أو Facebook —
          محتاج تفتح الصفحة في Safari
        </p>
      </div>

      <div className="w-full max-w-[340px] bg-surface border border-subtle rounded-3xl p-5
        flex flex-col gap-3 text-right">
        <div className="text-[12px] font-bold text-ink-primary">إزاي تفتحها في Safari؟</div>

        {[
          { n: 1, title: 'افتح الـ menu', sub: 'اضغط ··· أو سهم المشاركة ↗' },
          { n: 2, title: 'اختار "Open in Safari"', sub: 'أو "افتح في Safari"' },
          { n: 3, title: 'اسمح بالكاميرا', sub: 'اضغط Allow لما يسألك' },
        ].map(s => (
          <div key={s.n} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center
              text-[11px] font-bold text-white flex-shrink-0 mt-0.5">
              {s.n}
            </div>
            <div>
              <div className="text-[12px] font-semibold text-ink-primary">{s.title}</div>
              <div className="text-[11px] text-ink-muted">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={copyUrl}
        className="w-full max-w-[340px] flex items-center justify-center gap-2
          bg-surface border border-accent/30 rounded-2xl py-3.5
          text-[14px] font-bold text-accent transition-quart active:scale-95"
      >
        {copied ? '✅ تم النسخ!' : '📋 انسخ الرابط'}
      </button>
    </div>
  );
}
