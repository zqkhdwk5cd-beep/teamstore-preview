import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

export async function removeBg(inputPath: string, outputPath: string): Promise<void> {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const output = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;
    const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];
    const a = channels === 4 ? data[srcIdx + 3] : 255;
    const maxDiff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
    const isWhite = r > 230 && g > 230 && b > 230;
    const isGray  = maxDiff < 22 && r > 195;
    output[dstIdx] = r; output[dstIdx+1] = g; output[dstIdx+2] = b;
    output[dstIdx+3] = isWhite || isGray ? 0 : a;
  }

  await sharp(output, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
}

export async function generatePreviewImage(opts: {
  frameImagePath: string;
  caseImagePath: string;
  outputPath: string;
  bgColor?: [number, number, number];
}): Promise<void> {
  const { frameImagePath, caseImagePath, outputPath, bgColor = [7, 7, 14] } = opts;

  const frameMeta = await sharp(frameImagePath).metadata();
  const FW = frameMeta.width!;
  const FH = frameMeta.height!;

  // Inner body area (frame border ~1.7% of width)
  const PAD = Math.round(FW * 0.017);
  const innerW = FW - PAD * 2;
  const innerH = FH - PAD * 2;

  // Scale case to fill inner area
  const caseMeta = await sharp(caseImagePath).metadata();
  const CW = caseMeta.width!;
  const CH = caseMeta.height!;
  const ratio = Math.max(innerW / CW, innerH / CH);
  const scaledW = Math.round(CW * ratio);
  const scaledH = Math.round(CH * ratio);

  // Resize + center crop case
  const caseResized = await sharp(caseImagePath)
    .resize(scaledW, scaledH, { fit: 'fill' })
    .extract({
      left: Math.round((scaledW - innerW) / 2),
      top:  Math.round((scaledH - innerH) / 2),
      width: innerW,
      height: innerH,
    })
    .png()
    .toBuffer();

  // Composite: bg + case in frame area + frame on top
  await sharp({
    create: { width: FW, height: FH, channels: 4,
      background: { r: bgColor[0], g: bgColor[1], b: bgColor[2], alpha: 255 } }
  })
    .composite([
      // Case fills inner body
      { input: caseResized, left: PAD, top: PAD, blend: 'over' },
      // Phone frame on top (transparent body → case shows, opaque camera/border)
      { input: frameImagePath, blend: 'over' },
    ])
    .png()
    .toFile(outputPath);
}

export async function processProductImages(
  originalPath: string,
  productId: string,
  series: 'standard' | 'pro' | 'plus'
): Promise<{ cutoutUrl: string; previewUrl: string }> {
  const cutoutFilename  = `${productId}_cutout.png`;
  const previewFilename = `${productId}_preview_${series}.png`;
  const cutoutAbsPath   = path.join(UPLOADS_DIR, 'cutouts', cutoutFilename);
  const previewAbsPath  = path.join(UPLOADS_DIR, 'previews', previewFilename);

  await removeBg(originalPath, cutoutAbsPath);

  const framePath = path.join(PUBLIC_DIR, 'mockups', `${series}_frame.png`);

  if (fs.existsSync(framePath)) {
    await generatePreviewImage({
      frameImagePath: framePath,
      caseImagePath: originalPath,
      outputPath: previewAbsPath,
    });
  } else {
    fs.copyFileSync(cutoutAbsPath, previewAbsPath);
  }

  return {
    cutoutUrl:  `/uploads/cutouts/${cutoutFilename}`,
    previewUrl: `/uploads/previews/${previewFilename}`,
  };
}
