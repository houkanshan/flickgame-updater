const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG
const { canvasWidth, canvasHeight } = require('./constants')
const palette = require('./palette')

function hexToRgb(hex) {
  return hex.slice(1).match(/.{2}/g).map((c) => parseInt(c, 16))
}

const defaultRgbColor = hexToRgb(palette[0])


module.exports = function createEmptyPng(dir, fileBaseName) {
  const png = new PNG({
    width: canvasWidth,
    height: canvasHeight,
  })

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2
      png.data[idx] = defaultRgbColor[0]
      png.data[idx + 1] = defaultRgbColor[1]
      png.data[idx + 2] = defaultRgbColor[2]
      png.data[idx + 3] = 255
    }
  }

  const buffer = PNG.sync.write(png)
  fs.writeFileSync(
    path.join(dir, `${fileBaseName}.png`),
    buffer
  )
}