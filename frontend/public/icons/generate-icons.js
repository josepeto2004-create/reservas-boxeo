/**
 * Ejecuta este script para generar todos los iconos de la PWA:
 *   node generate-icons.js
 *
 * Requiere: npm install canvas  (solo para generar los iconos)
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
 
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, 'public', 'icons');
 
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
 
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.12; // border radius
 
  // Fondo oscuro redondeado
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
 
  // Círculo rojo
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#E24B4A';
  ctx.fill();
 
  // Guante de boxeo (emoji escalado)
  ctx.font = `${size * 0.42}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🥊', cx, cy + size * 0.03);
 
  return canvas.toBuffer('image/png');
}
 
sizes.forEach((size) => {
  const buf = drawIcon(size);
  const outPath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`✅ icon-${size}.png`);
});
 
console.log('\n🎉 Todos los iconos generados en public/icons/');
 