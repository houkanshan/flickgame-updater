const fs = require('fs')
const { PNG } = require('pngjs')
const chunk = require('lodash.chunk')
const colorPalette = require('./palette')

function rgbToHex(rgbColor) {
  return '#' + rgbColor.slice(0, 3).map((c) => c.toString(16).padStart(2, '0')).join('')
}

function rgbColorsToIndexes(colors, palette) {
  return colors.map((c) => palette.indexOf(rgbToHex(c)))
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

module.exports = function encodeImage(fileName) {
  const data = fs.readFileSync(fileName)
  const png = PNG.sync.read(data)
  const rgbColors = chunk(png.data, 4)
  const indexColors = rgbColorsToIndexes(rgbColors, colorPalette)
  const indexString = indexesToString(indexColors)
  return RLE_encode(indexString)
}