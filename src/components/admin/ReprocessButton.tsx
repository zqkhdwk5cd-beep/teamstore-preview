'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReprocessButton({ productId }: { productId: string }) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleReprocess = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/products/${productId}/reprocess`, { method: 'POST' });
      if (res.ok) {
        setDone(true);
        setTimeout(() => { setDone(false); router.refresh(); }, 1200);
      }
    } catch {
      //
    } finally {
      setProcessing(false);
    }
  };

  if (done) return <span className="text-[11px] text-green">✓ جاهز</span>;

  return (
    <button
      onClick={handleReprocess}
      disabled={processing}
      className="text-[11px] text-gold/70 hover:text-gold transition-quart disabled:opacity-50"
    >
      {processing ? '...' : '⟳ معالجة'}
    </button>
  );
}
