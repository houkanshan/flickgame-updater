#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander')
const chokidar = require('chokidar')
const glob = require('glob')
const encodeImage = require('./encodeImage')
const debounce = require('lodash.debounce')
const pkgJson = require('./package')
const { updateToGist, createGist, readFromGist } = require('./github')
const log = require('./log')

const emptyCanvas = [16000, '0']
const emptyLink = Array(16).fill(0)

program.version(pkgJson.version)

program
  .option('--token <github_token>', 'Your GitHub token for reading/writing your gist. https://github.com/settings/tokens')
  .option('--gist <gist_id>', 'The gist ID of your flickgame. If not provided, we will create a new gist.')
  .option('--dir <dir>', 'Where your png files located in. Default: ./')
  .option('--watch', 'Start a watcher')
  .action(async function(options) {
    let { gist, dir = '.', token, watch } = options
    if (!token) {
      return program.help()
    }

    let hyperlinks = Array(16).fill(emptyLink)
    let canvasses = Array(16).fill(emptyCanvas)
    let gameLink = "www.flickgame.org"

    if (!gist) {
      log('Creating new gist...')
      gist = await createGist(token)
    } else {
      log(`Reading gist ${gist} ...`)
      data = await readFromGist(token, gist)
      hyperlinks = data.hyperlinks
      canvasses = data.canvasses
      gameLink = data.gameLink
    }


    if (watch) {
      return startWatch({ gist, dir, token, hyperlinks, canvasses, gameLink })
    } else {
      return run({ gist, dir, token, hyperlinks, canvasses, gameLink })
    }
  })

program.parse(process.argv)



async function run({ dir, gist, token, hyperlinks, canvasses, gameLink }) {


  glob(path.join(dir, '*.png'), function (err, files) {
    // Fill new canvasses from files to the original canvasses from gist.
    const newCanvasses = files.map(encodeImage)
    const canvasIndexes = files.map((f) => parseInt(path.basename(f, '.png') - 1))
    canvasIndexes.forEach(function(canvasIndex, i) {
      canvasses[canvasIndex] = newCanvasses[i]
    })

    const json = {
      gameLink,
      canvasses,
      hyperlinks,
    }

    log(`Encoded ${newCanvasses.length} png files`)

    const content = JSON.stringify(json)

    fs.writeFileSync(path.join(dir, 'game.json'), content)
    updateToGist(token, gist, content)
  })
}

function startWatch(options) {
  const { dir } = options

  const watcher = chokidar.watch([
    path.join(dir, '*.png')
  ])

  let lastRun = Promise.resolve()

  const callback = debounce(async function() {
    await lastRun
    lastRun = await run(options)
  }, 500)

  watcher.on('all', callback)
}