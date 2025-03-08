/**
 * Favicon Generation Guide
 * 
 * This script provides instructions for generating a complete favicon package.
 */

console.log(`
=====================================================
📂 FAVICON GENERATION GUIDE FOR WITT EXPLORER APP 📂
=====================================================

To generate a complete set of favicons for maximum compatibility:

OPTION 1: RECOMMENDED - ONLINE GENERATOR
----------------------------------------
1. Go to https://realfavicongenerator.net/
2. Upload the public/favicon.svg or public/witt-favicon.svg file
3. Configure options:
   - Background color: #2E3A59
   - Keep "W" symbol centered
   - Generate icons for all platforms
4. Download the package
5. Extract all files to your 'public' directory
6. The generator will create:
   - favicon.ico
   - apple-touch-icon.png
   - favicon-192x192.png
   - favicon-512x512.png
   - ms-icon-144x144.png
   - And more platform-specific icons

OPTION 2: MANUAL CREATION (Requires Node.js tools)
--------------------------------------------------
1. Install required packages:
   npm install -g svg2png-cli
   npm install -g png-to-ico

2. Generate PNG files in different sizes:
   svg2png public/favicon.svg -o public/favicon-16x16.png -w 16 -h 16
   svg2png public/favicon.svg -o public/favicon-32x32.png -w 32 -h 32
   svg2png public/favicon.svg -o public/favicon-48x48.png -w 48 -h 48
   svg2png public/favicon.svg -o public/favicon-64x64.png -w 64 -h 64
   svg2png public/favicon.svg -o public/favicon-128x128.png -w 128 -h 128
   svg2png public/favicon.svg -o public/apple-touch-icon.png -w 180 -h 180
   svg2png public/favicon.svg -o public/ms-icon-144x144.png -w 144 -h 144
   svg2png public/favicon.svg -o public/favicon-192x192.png -w 192 -h 192
   svg2png public/favicon.svg -o public/favicon-512x512.png -w 512 -h 512

3. Create favicon.ico (contains multiple sizes):
   png-to-ico public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/favicon-64x64.png > public/favicon.ico

OPTION 3: QUICK TEMPORARY SOLUTION
---------------------------------
If you just need a basic favicon.ico file immediately:
1. Go to https://favicon.io/favicon-converter/
2. Upload the public/favicon.svg file
3. Download the package
4. Extract the favicon.ico file to your 'public' directory

NOTE: The _document.tsx file has been updated to reference:
- favicon.ico (primary icon)
- favicon.svg (for modern browsers)
- apple-touch-icon.png (for iOS)
- ms-icon-144x144.png (for Microsoft)
- favicon-192x192.png and favicon-512x512.png (for PWA)

Until you generate these files, browsers will show a default icon or no icon.

-----------------------------------------------------
`);

console.log('\x1b[32m%s\x1b[0m', 'To run this guide again, use: npm run generate-favicon'); 