import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const sizes = [
  { width: 192, height: 192, name: 'pwa-192x192.png' },
  { width: 512, height: 512, name: 'pwa-512x512.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' }
];

async function generateIcons() {
  const sourceIcon = path.resolve(process.cwd(), 'generated-icon.png');
  const targetDir = path.resolve(process.cwd(), 'client/public');

  for (const size of sizes) {
    await sharp(sourceIcon)
      .resize(size.width, size.height)
      .toFile(path.join(targetDir, size.name));
  }
}

generateIcons().catch(console.error); 