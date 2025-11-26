// scripts/check-images.js
// Scans the assets/ folder for image files and attempts to read them with jimp-compact
// Usage: node scripts/check-images.js

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp-compact');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function checkImage(filePath) {
  try {
    const img = await Jimp.read(filePath);
    return { ok: true, width: img.bitmap.width, height: img.bitmap.height };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

(async () => {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('assets directory not found:', ASSETS_DIR);
    process.exit(2);
  }

  // Only check raster image formats that Jimp supports. Skip SVGs (vector) because Jimp cannot parse them.
  const files = fs.readdirSync(ASSETS_DIR).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
  if (!files.length) {
    console.log('No image files found in assets/');
    process.exit(0);
  }

  let hadError = false;
  console.log(`Checking ${files.length} image(s) in assets/`);
  for (const f of files) {
    const p = path.join(ASSETS_DIR, f);
    const stat = fs.statSync(p);
    if (stat.size === 0) {
      console.error(`${f}: FAILED -> zero-byte file`);
      hadError = true;
      continue;
    }

    process.stdout.write(`${f}: `);
    // Try to read with Jimp
    // Use await to get specific error per file
    try {
      const res = await checkImage(p);
      if (res.ok) {
        console.log(`OK (${res.width}x${res.height}, ${stat.size} bytes)`);
      } else {
        console.error(`FAILED -> ${res.error}`);
        hadError = true;
      }
    } catch (err) {
      console.error(`FAILED -> ${err.message || err}`);
      hadError = true;
    }
  }

  if (hadError) {
    console.error(
      '\nOne or more image files failed to load. Replace or repair the failing files and re-run `npx expo prebuild --clean`.'
    );
    process.exit(1);
  }

  console.log('\nAll images appear valid.');
  process.exit(0);
})();
