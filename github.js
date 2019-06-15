const Octokit = require('@octokit/rest')
const log = require('./log')

module.exports.updateGist = function(githubToken, gistId, content) {
  const octokit = new Octokit({
    auth: githubToken,
    log: {
      error: console.error
    }
  })
  log('Updating gist...')
  octokit.gists.update({
    gist_id: gistId,
    files: {
      "game.txt": { content }
    }
  }).then(() => {
    log(`Flickgame is updated: https://www.flickgame.org/play.html?p=${gistId}`)
  })
}