const fs = require('fs')
const { PNG } = require('pngjs')
const chunk = require('lodash.chunk')
const colorPalette = require('./palette')
const { canvasWidth, canvasHeight } = require('./constants')

function rgbToHex(rgbColor) {
  return '#' + rgbColor.slice(0, 3).map((c) => c.toString(16).padStart(2, '0')).join('')
}

function rgbColorToIndex(color, palette) {
  const hexColor = rgbToHex(color)
  const index = palette.indexOf(hexColor)
  if (index < 0) {
    invalidColor.add(hexColor)
    return 0
  }
  return index
}

function rgbColorsToIndexes(colors, palette) {
  return colors.map((c) => rgbColorToIndex(c, palette))
}

function indexesToString(indexes) {
  return indexes.map((i) => i.toString(16)).join('')
}

function RLE_encode(input) {
    var encoding = [];
    var prev, count, i;
    for (count = 1, prev = input[0], i = 1; i < input.length; i++) {
        if (input[i] != prev) {
            encoding.push(count);
            encoding.push(prev);
            count = 1;
            prev = input[i];
        }
        else
            count ++;
    }
    encoding.push(count);
    encoding.push(prev);
    return encoding;
}

let invalidColor = new Set()

module.exports = function encodeImage(fileName) {
  invalidColor = new Set()
  const errors = []
  const data = fs.readFileSync(fileName)
  const png = PNG.sync.read(data)
  if (png.width !== canvasWidth || png.height !== canvasHeight) {
    errors.push(
      `Image size should be ${canvasWidth}x${canvasHeight}, ` +
      `you're using ${png.width}x${png.height}.`
    )
  }
  const rgbColors = chunk(png.data, 4)
  const indexColors = rgbColorsToIndexes(rgbColors, colorPalette)
  const indexString = indexesToString(indexColors)

  if (invalidColor.size) {
    errors.push(`${[...invalidColor].join(',')} is out of palette. Using ${colorPalette[0]} as fallback.`)
  }

  return [RLE_encode(indexString), errors]
}