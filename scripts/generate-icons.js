// Run with: node scripts/generate-icons.js
// Requires: npm install canvas (run once)
const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0a0f1e'
  ctx.beginPath()
  const r = size * 0.15
  ctx.roundRect(0, 0, size, size, r)
  ctx.fill()

  // Amber square
  ctx.fillStyle = '#f59e0b'
  const margin = size * 0.15
  ctx.beginPath()
  ctx.roundRect(margin, margin, size - margin * 2, size - margin * 2, r * 0.8)
  ctx.fill()

  // "P" letter
  ctx.fillStyle = '#0a0f1e'
  ctx.font = `bold ${size * 0.5}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generateIcon(192))
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generateIcon(512))

console.log('Icons generated!')
