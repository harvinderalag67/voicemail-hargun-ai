const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPng(width, height, isMaskable = false) {
  // RGBA buffer with filter byte 0x00 at the start of each row
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(rowStride * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isMaskable ? 0.35 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base dark slate navy background
      let r = 11;
      let g = 15;
      let b = 25;
      let a = 255;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded container or circular emblem
      if (dist <= radius) {
        // Gradient from indigo (79, 70, 229) to darker indigo (49, 46, 129)
        const t = (dy + radius) / (2 * radius);
        r = Math.round(79 * (1 - t) + 40 * t);
        g = Math.round(70 * (1 - t) + 30 * t);
        b = Math.round(229 * (1 - t) + 150 * t);

        // Microphone motif in center
        // Mic capsule: centered, width ~ radius * 0.4, height ~ radius * 0.7
        const micWidth = radius * 0.32;
        const micHeight = radius * 0.65;
        const micTop = cy - radius * 0.45;
        const micBottom = micTop + micHeight;

        const inCapsuleX = Math.abs(x - cx) <= micWidth;
        const inCapsuleY = y >= micTop && y <= micBottom;

        if (inCapsuleX && inCapsuleY) {
          // Sunset orange highlight (#F97316: 249, 115, 22)
          r = 249;
          g = 115;
          b = 22;
        }

        // Soundwave rings around mic
        const ringDist = Math.abs(dist - radius * 0.75);
        if (ringDist < width * 0.02 && Math.abs(dx) > radius * 0.3) {
          r = 243;
          g = 244;
          b = 246;
          a = 230;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Deflate raw data
  const compressed = zlib.deflateSync(rawData);

  // Build PNG chunks
  // 1. Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // 2. IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter: standard
  ihdrData[12] = 0; // Interlace: none

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcBuf = chunk.subarray(4, 8 + len);
  const c = crc32(crcBuf);
  chunk.writeUInt32BE(c, 8 + len);
  return chunk;
}

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate files
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));

console.log('Successfully generated PWA icon PNGs in /public');
