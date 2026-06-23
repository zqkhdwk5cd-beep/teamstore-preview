'use client';

import { useState, useCallback } from 'react';
import { IPhoneModel, Product } from '@/types';
import ModelSelector from '@/components/customer/ModelSelector';
import Scanner from '@/components/customer/Scanner';
import ProductPreview from '@/components/customer/ProductPreview';
import InAppBrowserWall from '@/components/customer/InAppBrowserWall';

type Step = 'model' | 'scan' | 'preview';

export default function CustomerApp() {
  const [step, setStep] = useState<Step>('model');
  const [selectedModel, setSelectedModel] = useState<IPhoneModel | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const navigate = useCallback((to: Step, dir: 'forward' | 'back' = 'forward') => {
    setDirection(dir);
    setStep(to);
  }, []);

  const animClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';

  const stepNum = step === 'model' ? 1 : step === 'scan' ? 2 : 3;

  return (
    <>
      <InAppBrowserWall />
      <div className="fixed inset-0 pointer-events-none z-0 ambient-bg" />

      <div className="relative z-10 min-h-[100dvh] flex flex-col max-w-[430px] mx-auto">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-4
          border-b border-subtle backdrop-blur-sm bg-void/80 sticky top-0 z-20">
          <div className="text-[17px] font-black tracking-wider">
            TEAM<span className="text-accent">STORE</span>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-subtle
            rounded-full px-3 py-1.5 text-[11px] text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            خطوة <strong className="text-accent mr-0.5">{stepNum}</strong> من 3
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {step === 'model' && (
            <div key="model" className={`absolute inset-0 overflow-y-auto scrollbar-none ${animClass}`}>
              <ModelSelector
                selected={selectedModel}
                onSelect={setSelectedModel}
                onConfirm={() => navigate('scan')}
              />
            </div>
          )}
          {step === 'scan' && (
            <div key="scan" className={`absolute inset-0 overflow-y-auto scrollbar-none ${animClass}`}>
              <Scanner
                selectedModel={selectedModel!}
                onSuccess={(p) => { setProduct(p); navigate('preview'); }}
                onBack={() => navigate('model', 'back')}
              />
            </div>
          )}
          {step === 'preview' && product && (
            <div key="preview" className={`absolute inset-0 overflow-y-auto scrollbar-none ${animClass}`}>
              <ProductPreview
                product={product}
                model={selectedModel!}
                onScanAnother={() => { setProduct(null); navigate('scan', 'back'); }}
                onChangeModel={() => { setProduct(null); navigate('model', 'back'); }}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
