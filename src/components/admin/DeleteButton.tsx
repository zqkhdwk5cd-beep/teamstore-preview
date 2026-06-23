'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  productId: string;
  productName: string;
}

export default function DeleteButton({ productId, productName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[11px] text-red font-bold hover:underline disabled:opacity-50"
        >
          {deleting ? '...' : 'تأكيد'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[11px] text-ink-muted hover:underline"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[11px] text-red/60 hover:text-red transition-quart"
    >
      حذف
    </button>
  );
}
