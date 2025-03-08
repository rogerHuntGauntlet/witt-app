/**
 * Create Temporary Favicon Script
 * 
 * This script can be used to quickly generate a basic favicon.ico file
 * using the 'png-to-ico' package.
 * 
 * Prerequisites:
 * 1. Install required packages:
 *    npm install canvas png-to-ico fs
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const pngToIco = require('png-to-ico');

// Create a temporary PNG file
async function createTempPng() {
  // Create a 32x32 canvas
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = '#2E3A59';
  ctx.fillRect(0, 0, 32, 32);

  // Draw a "W" letter
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('W', 6, 24);

  // Draw a line at the bottom
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, 28);
  ctx.lineTo(28, 28);
  ctx.stroke();

  // Save to a PNG file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./public/temp-favicon.png', buffer);
  
  console.log('Temporary PNG file created at ./public/temp-favicon.png');
  return './public/temp-favicon.png';
}

// Convert PNG to ICO
async function convertPngToIco(pngPath) {
  try {
    const buffer = await pngToIco([pngPath]);
    fs.writeFileSync('./public/favicon.ico', buffer);
    console.log('favicon.ico created successfully at ./public/favicon.ico');
    
    // Clean up temporary PNG
    fs.unlinkSync(pngPath);
    console.log('Temporary PNG file removed');
  } catch (error) {
    console.error('Error creating ICO file:', error);
  }
}

// Main function
async function main() {
  console.log('Creating temporary favicon.ico...');
  try {
    const pngPath = await createTempPng();
    await convertPngToIco(pngPath);
    console.log('\nSuccess! You now have a basic favicon.ico file.');
    console.log('For a more comprehensive favicon package, run: npm run generate-favicon');
  } catch (error) {
    console.error('Error:', error);
    console.log('\nPlease follow the instructions in the generate-favicon script instead:');
    console.log('npm run generate-favicon');
  }
}

// Run the script
main(); 