import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const sourceIconDark = path.join(__dirname, '../src/assets/bt-logo-dark.png');
const sourceIconLight = path.join(__dirname, '../src/assets/bt-logo-light.png');
const targetDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Generate dark theme icons
sizes.forEach(size => {
  sharp(sourceIconDark)
    .resize(size, size)
    .toFile(path.join(targetDir, `icon-dark-${size}x${size}.png`))
    .then(() => console.log(`Generated dark ${size}x${size} icon`))
    .catch(err => console.error(`Error generating dark ${size}x${size} icon:`, err));
});

// Generate light theme icons
sizes.forEach(size => {
  sharp(sourceIconLight)
    .resize(size, size)
    .toFile(path.join(targetDir, `icon-light-${size}x${size}.png`))
    .then(() => console.log(`Generated light ${size}x${size} icon`))
    .catch(err => console.error(`Error generating light ${size}x${size} icon:`, err));
});