// extract-qr.js
// Extrae la región blanca que contiene el código QR y guarda como PNG con margen.
// Uso: node tools/extract-qr.js input.jpg output.png [margin]

const sharp = require('sharp');
const fs = require('fs');

async function findWhiteBoundingBox(inputPath, threshold = 240) {
  const { data, info } = await sharp(inputPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // channels will be 1 after greyscale
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const v = data[idx];
      if (v >= threshold) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) return null;
  return { left: minX, top: minY, width: (maxX - minX + 1), height: (maxY - minY + 1), imgWidth: width, imgHeight: height };
}

async function cropWhiteBox(inputPath, outputPath, margin = 8) {
  try {
    const box = await findWhiteBoundingBox(inputPath);
    if (!box) {
      console.warn('No white bounding box found; fallback to center-square crop');
      const meta = await sharp(inputPath).metadata();
      const size = Math.min(meta.width, meta.height);
      const left = Math.floor((meta.width - size) / 2);
      const top = Math.floor((meta.height - size) / 2);
      await sharp(inputPath)
        .extract({ left, top, width: size, height: size })
        .png({ quality: 100 })
        .toFile(outputPath);
      console.log('Saved center-square fallback to', outputPath);
      return;
    }

    let { left, top, width, height, imgWidth, imgHeight } = box;
    left = Math.max(0, left - margin);
    top = Math.max(0, top - margin);
    const right = Math.min(imgWidth, left + width + 2 * margin);
    const bottom = Math.min(imgHeight, top + height + 2 * margin);
    const outW = right - left;
    const outH = bottom - top;

    await sharp(inputPath)
      .extract({ left, top, width: outW, height: outH })
      .png({ quality: 100 })
      .toFile(outputPath);

    console.log('Saved cropped QR to', outputPath);
  } catch (err) {
    console.error('Error cropping:', err);
    throw err;
  }
}

(async () => {
  const [,, input, output, marginArg] = process.argv;
  if (!input || !output) {
    console.error('Usage: node tools/extract-qr.js input.jpg output.png [margin]');
    process.exit(1);
  }
  if (!fs.existsSync(input)) {
    console.error('Input file not found:', input);
    process.exit(1);
  }
  const margin = marginArg ? parseInt(marginArg, 10) : 8;
  await cropWhiteBox(input, output, margin);
})();
