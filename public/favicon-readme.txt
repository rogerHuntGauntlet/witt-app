FAVICON FILES FOR WITTGENSTEIN INTERPRETATION EXPLORER
=========================================================

This directory should contain the following favicon files:

1. favicon.ico - The primary favicon file (multi-size ICO format)
2. favicon.svg - SVG version for modern browsers
3. favicon-192x192.png - For Android/PWA
4. favicon-512x512.png - For Android/PWA
5. apple-touch-icon.png - For iOS devices
6. ms-icon-144x144.png - For Microsoft tiles

To generate these files, you can run one of the following commands:

Option 1: Generate guidance for favicons
  npm run generate-favicon
  
Option 2: Create a basic temporary favicon.ico using Node.js
  npm run create-favicon
  (requires installing dependencies: npm install canvas png-to-ico)
  
Option 3: Follow the tutorial at https://realfavicongenerator.net/
  and upload the SVG file from this directory

For production use, we recommend using Option 3 to create a complete
favicon package with all the necessary files and sizes. 