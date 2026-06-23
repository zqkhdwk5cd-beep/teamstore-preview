export type IPhoneModel =
  | 'iphone-11' | 'iphone-12' | 'iphone-12-mini'
  | 'iphone-13' | 'iphone-13-mini'
  | 'iphone-14' | 'iphone-14-plus'
  | 'iphone-14-pro' | 'iphone-14-pro-max'
  | 'iphone-15' | 'iphone-15-plus'
  | 'iphone-15-pro' | 'iphone-15-pro-max'
  | 'iphone-16' | 'iphone-16-plus'
  | 'iphone-16-pro' | 'iphone-16-pro-max';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  nameAr: string;
  model: IPhoneModel;
  color: string;
  colorAr: string;
  price: number;
  stock: number;
  originalImageUrl: string | null;
  cutoutImageUrl: string | null;
  previewImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockupTemplate {
  id: string;
  iphoneModel: IPhoneModel;
  displayName: string;
  displayNameAr: string;
  baseImageUrl: string;
  overlayX: number;
  overlayY: number;
  overlayWidth: number;
  overlayHeight: number;
  cameraHoleX: number;
  cameraHoleY: number;
  cameraHoleWidth: number;
  cameraHoleHeight: number;
  aspectRatio: number;
  series: 'standard' | 'pro' | 'plus';
}

export interface ScanResult {
  found: boolean;
  product?: Product;
  error?: string;
}

export const IPHONE_MODELS: Record<IPhoneModel, { nameAr: string; name: string; series: 'standard' | 'pro' | 'plus' }> = {
  'iphone-11':         { name: 'iPhone 11',          nameAr: 'آيفون 11',           series: 'standard' },
  'iphone-12':         { name: 'iPhone 12',          nameAr: 'آيفون 12',           series: 'standard' },
  'iphone-12-mini':    { name: 'iPhone 12 Mini',     nameAr: 'آيفون 12 ميني',      series: 'standard' },
  'iphone-13':         { name: 'iPhone 13',          nameAr: 'آيفون 13',           series: 'standard' },
  'iphone-13-mini':    { name: 'iPhone 13 Mini',     nameAr: 'آيفون 13 ميني',      series: 'standard' },
  'iphone-14':         { name: 'iPhone 14',          nameAr: 'آيفون 14',           series: 'standard' },
  'iphone-14-plus':    { name: 'iPhone 14 Plus',     nameAr: 'آيفون 14 بلس',       series: 'plus' },
  'iphone-14-pro':     { name: 'iPhone 14 Pro',      nameAr: 'آيفون 14 برو',       series: 'pro' },
  'iphone-14-pro-max': { name: 'iPhone 14 Pro Max',  nameAr: 'آيفون 14 برو ماكس',  series: 'pro' },
  'iphone-15':         { name: 'iPhone 15',          nameAr: 'آيفون 15',           series: 'standard' },
  'iphone-15-plus':    { name: 'iPhone 15 Plus',     nameAr: 'آيفون 15 بلس',       series: 'plus' },
  'iphone-15-pro':     { name: 'iPhone 15 Pro',      nameAr: 'آيفون 15 برو',       series: 'pro' },
  'iphone-15-pro-max': { name: 'iPhone 15 Pro Max',  nameAr: 'آيفون 15 برو ماكس',  series: 'pro' },
  'iphone-16':         { name: 'iPhone 16',          nameAr: 'آيفون 16',           series: 'standard' },
  'iphone-16-plus':    { name: 'iPhone 16 Plus',     nameAr: 'آيفون 16 بلس',       series: 'plus' },
  'iphone-16-pro':     { name: 'iPhone 16 Pro',      nameAr: 'آيفون 16 برو',       series: 'pro' },
  'iphone-16-pro-max': { name: 'iPhone 16 Pro Max',  nameAr: 'آيفون 16 برو ماكس',  series: 'pro' },
};
