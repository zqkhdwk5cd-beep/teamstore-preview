import fs from 'fs';
import path from 'path';
import { Product, MockupTemplate, IPhoneModel } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

interface DB {
  products: Product[];
  mockups: MockupTemplate[];
  version: number;
}

function ensureDirs() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  ['originals', 'cutouts', 'previews'].forEach(d => {
    const p = path.join(UPLOADS_DIR, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });
}

function readDB(): DB {
  ensureDirs();
  if (!fs.existsSync(DB_PATH)) {
    const initial: DB = { products: [], mockups: defaultMockups(), version: 1 };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(db: DB): void {
  ensureDirs();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function defaultMockups(): MockupTemplate[] {
  // Mockup templates define where the case overlay sits on each phone image
  const templates: MockupTemplate[] = [
    {
      id: 'standard',
      iphoneModel: 'iphone-16' as IPhoneModel,
      displayName: 'iPhone 11–16',
      displayNameAr: 'آيفون 11–16',
      baseImageUrl: '/mockups/standard.png',
      overlayX: 0, overlayY: 0, overlayWidth: 1, overlayHeight: 1,
      cameraHoleX: 0.58, cameraHoleY: 0.09, cameraHoleWidth: 0.32, cameraHoleHeight: 0.22,
      aspectRatio: 2.1,
      series: 'standard',
    },
    {
      id: 'pro',
      iphoneModel: 'iphone-16-pro' as IPhoneModel,
      displayName: 'iPhone 14–16 Pro',
      displayNameAr: 'آيفون 14–16 برو',
      baseImageUrl: '/mockups/pro.png',
      overlayX: 0, overlayY: 0, overlayWidth: 1, overlayHeight: 1,
      cameraHoleX: 0.56, cameraHoleY: 0.08, cameraHoleWidth: 0.36, cameraHoleHeight: 0.28,
      aspectRatio: 2.1,
      series: 'pro',
    },
    {
      id: 'plus',
      iphoneModel: 'iphone-16-pro-max' as IPhoneModel,
      displayName: 'iPhone Pro Max / Plus',
      displayNameAr: 'آيفون برو ماكس / بلس',
      baseImageUrl: '/mockups/plus.png',
      overlayX: 0, overlayY: 0, overlayWidth: 1, overlayHeight: 1,
      cameraHoleX: 0.56, cameraHoleY: 0.08, cameraHoleWidth: 0.36, cameraHoleHeight: 0.30,
      aspectRatio: 2.18,
      series: 'plus',
    },
  ];
  return templates;
}

// ── Products ────────────────────────────────
export function getAllProducts(): Product[] {
  return readDB().products;
}

export function getProductByBarcode(barcode: string): Product | null {
  const db = readDB();
  return db.products.find(p => p.barcode === barcode) ?? null;
}

export function getProductById(id: string): Product | null {
  const db = readDB();
  return db.products.find(p => p.id === id) ?? null;
}

export function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const db = readDB();
  const product: Product = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.products.push(product);
  writeDB(db);
  return product;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const db = readDB();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...data, updatedAt: new Date().toISOString() };
  writeDB(db);
  return db.products[idx];
}

export function deleteProduct(id: string): boolean {
  const db = readDB();
  const before = db.products.length;
  db.products = db.products.filter(p => p.id !== id);
  writeDB(db);
  return db.products.length < before;
}

// ── Mockups ─────────────────────────────────
export function getMockupTemplates(): MockupTemplate[] {
  return readDB().mockups;
}

export function getMockupBySeries(series: string): MockupTemplate | null {
  return readDB().mockups.find(m => m.series === series) ?? null;
}
