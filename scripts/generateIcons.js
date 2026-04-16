const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const src = path.join(__dirname, '..', 'public', 'Chapita-logo.jpg');
const outDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  for (const size of [192, 512]) {
    await sharp(src)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(path.join(outDir, `chapita_icon_${size}.png`));
    console.log(`Generated chapita_icon_${size}.png`);
  }
  // Also generate apple-touch-icon (180x180)
  await sharp(src)
    .resize(180, 180, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
})();
