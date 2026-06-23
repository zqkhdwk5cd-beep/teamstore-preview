import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { IPhoneModel, IPHONE_MODELS } from '@/types';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

export async function removeBg(inputPath: string, outputPath: string): Promise<void> {
  // Load image
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (channels < 3) throw new Error('Image must be RGB/RGBA');

  const output = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;
    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];
    const a = channels === 4 ? data[srcIdx + 3] : 255;

    // Detect near-white and near-gray background
    const isWhite = r > 230 && g > 230 && b > 230;
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    const isGray = maxDiff < 25 && r > 190;

    output[dstIdx] = r;
    output[dstIdx + 1] = g;
    output[dstIdx + 2] = b;
    output[dstIdx + 3] = isWhite || isGray ? 0 : a;
  }

  await sharp(output, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);
}

export async function normalizeCaseImage(
  inputPath: string,
  outputPath: string,
  targetWidth = 800,
  targetHeight = 1600
): Promise<void> {
  // Auto-trim transparent/white margins, then resize to fit target
  await sharp(inputPath)
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 }, threshold: 30 })
    .resize(targetWidth, targetHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);
}

export interface CompositeOptions {
  phoneImagePath: string;   // base phone mockup PNG
  caseImagePath: string;    // cutout case PNG (transparent bg)
  outputPath: string;
  // Overlay positioning (fractions of phone image dimensions)
  overlayXFraction?: number;
  overlayYFraction?: number;
  overlayWidthFraction?: number;
  overlayHeightFraction?: number;
}

export async function generatePreviewImage(opts: CompositeOptions): Promise<void> {
  const {
    phoneImagePath,
    caseImagePath,
    outputPath,
    overlayXFraction = 0,
    overlayYFraction = 0,
    overlayWidthFraction = 1,
    overlayHeightFraction = 1,
  } = opts;

  const phone = sharp(phoneImagePath);
  const phoneMeta = await phone.metadata();
  const phoneW = phoneMeta.width!;
  const phoneH = phoneMeta.height!;

  // Compute case overlay dimensions
  const caseLeft = Math.round(phoneW * overlayXFraction);
  const caseTop  = Math.round(phoneH * overlayYFraction);
  const caseW    = Math.round(phoneW * overlayWidthFraction);
  const caseH    = Math.round(phoneH * overlayHeightFraction);

  // Resize case to fit overlay area
  const resizedCase = await sharp(caseImagePath)
    .resize(caseW, caseH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Composite case UNDER the phone frame (phone frame drawn on top)
  // Strategy: case first, then phone frame on top
  await sharp({
    create: { width: phoneW, height: phoneH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([
      // 1. Case layer
      { input: resizedCase, left: caseLeft, top: caseTop, blend: 'over' },
      // 2. Phone frame on top
      { input: phoneImagePath, blend: 'over' },
    ])
    .png()
    .toFile(outputPath);
}

export async function processProductImages(
  originalPath: string,
  productId: string,
  series: 'standard' | 'pro' | 'plus'
): Promise<{ cutoutPath: string; previewPath: string; cutoutUrl: string; previewUrl: string }> {
  const cutoutFilename = `${productId}_cutout.png`;
  const previewFilename = `${productId}_preview_${series}.png`;

  const cutoutAbsPath  = path.join(UPLOADS_DIR, 'cutouts', cutoutFilename);
  const previewAbsPath = path.join(UPLOADS_DIR, 'previews', previewFilename);

  // Step 1: Remove background
  await removeBg(originalPath, cutoutAbsPath);

  // Step 2: Normalize
  const normalizedPath = cutoutAbsPath.replace('.png', '_norm.png');
  await normalizeCaseImage(cutoutAbsPath, normalizedPath);

  // Step 3: Composite onto phone mockup
  const mockupPath = path.join(PUBLIC_DIR, 'mockups', `${series}.png`);

  // If mockup doesn't exist yet, just use the cutout as preview
  if (!fs.existsSync(mockupPath)) {
    fs.copyFileSync(normalizedPath, previewAbsPath);
  } else {
    await generatePreviewImage({
      phoneImagePath: mockupPath,
      caseImagePath: normalizedPath,
      outputPath: previewAbsPath,
    });
  }

  return {
    cutoutPath: cutoutAbsPath,
    previewPath: previewAbsPath,
    cutoutUrl: `/uploads/cutouts/${cutoutFilename}`,
    previewUrl: `/uploads/previews/${previewFilename}`,
  };
}
