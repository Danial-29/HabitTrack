import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
];

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22D3EE;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="#0F172A"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="url(#grad1)" stroke-width="22" stroke-linecap="round" stroke-dasharray="800 206"/>
  <path d="M176 266 L235 325 L346 202" fill="none" stroke="url(#grad2)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="120" fill="url(#grad1)" opacity="0.08"/>
</svg>`;

async function generateIcons() {
    const publicDir = path.join(process.cwd(), 'public');

    for (const { name, size } of sizes) {
        const outputPath = path.join(publicDir, name);

        await sharp(Buffer.from(svgContent))
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`Generated: ${name}`);
    }

    console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
