import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin – TEAM STORE',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void">
      {/* Admin header */}
      <header className="sticky top-0 z-30 border-b border-subtle bg-void/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-[15px] font-black tracking-wide">
              TEAM<span className="text-accent">STORE</span>
            </Link>
            <span className="px-2 py-0.5 bg-accent-dim border border-accent/20 rounded-full
              text-[10px] font-semibold text-accent">ADMIN</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/admin" className="px-3 py-1.5 rounded-lg text-[12px] text-ink-secondary
              hover:text-ink-primary hover:bg-surface transition-quart">
              المنتجات
            </Link>
            <Link href="/admin/add" className="px-3 py-1.5 rounded-lg text-[12px] bg-accent-dim
              text-accent border border-accent/20">
              + إضافة منتج
            </Link>
            <Link href="/" target="_blank" className="px-3 py-1.5 rounded-lg text-[12px]
              text-ink-muted hover:text-ink-primary transition-quart">
              ↗ المتجر
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
