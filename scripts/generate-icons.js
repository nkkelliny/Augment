// scripts/generate-icons.js
const path = require('path');
const iconGen = require('icon-gen');

(async () => {
  const src = path.join(__dirname, '..', 'assets', 'logo', 'augment-logo.svg');
  const dest = path.join(__dirname, '..', 'build', 'icons');

  try {
    const results = await iconGen(src, dest, {
      report: true,
      modes: ['ico', 'icns', 'favicon'], // favicon gives you PNGs too
      ico: {
        sizes: [16, 24, 32, 48, 64, 128, 256]
      },
      icns: {
        sizes: [16, 32, 64, 128, 256, 512, 1024]
      }
    });

    console.log('Icon generation complete:', results);
  } catch (err) {
    console.error('Icon generation failed:', err);
    process.exit(1);
  }
})();
