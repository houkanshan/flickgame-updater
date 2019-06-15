#!/usr/bin/env node

const program = require('commander')
const chokidar = require('chokidar')
const glob = require('glob')
const encodeImage = require('./encodeImage')
const debounce = require('lodash.debounce')
const pkgJson = require('./package')
const { updateGist } = require('./github')
const log = require('./log')

const emptyCanvas = [16000, '0']
const emptyLink = Array(16).fill(0)

program.version(pkgJson.version)

program
  .option('--gist <gist_id>', 'The Gist ID of your flickgame.')
  .option('--token <github_token>', 'Your GitHub token for reading/writing your gist. https://github.com/settings/tokens')
  .option('--dir <dir>', 'Where your png files located in. Default: ./')
  .option('--watch', 'Start a watcher')
  .action(function(options) {
    const { gist, dir = '.', token, watch } = options
    if (!gist || !token) {
      return program.help()
    }

    if (watch) {
      return startWatch({ gist, dir, token })
    } else {
      return run({ gist, dir, token })
    }
  })

program.parse(process.argv)



function run({ dir, gist, token }) {
  glob(`${dir}/*.png`, function (err, files) {
    const canvases = files.map(encodeImage)
    const fullCanvases = [...canvases, ...Array(16).fill(emptyCanvas)].slice(0, 16)

    const hyperlinks = [] // TODO
    const fullHyperlinks = [...hyperlinks, ...Array(16).fill(emptyLink)].slice(0, 16)

    const json = {
      gameLink: "www.flickgame.org",
      canvasses: fullCanvases,
      hyperlinks: fullHyperlinks,
    }

    log(`Encoded ${canvases.length} png files`)

    updateGist(token, gist, JSON.stringify(json))
  })
}

function startWatch({ dir, gist, token }) {
  const watcher = chokidar.watch([
    `${dir}/*.png`,
  ])

  const callback = debounce(function() {
    run({ dir, gist, token })
  })

  watcher.on('all', callback)
}