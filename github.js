const Octokit = require('@octokit/rest')
const log = require('./log')

function getOctokit(githubToken) {
  return new Octokit({
    auth: githubToken,
    log: {
      error: console.error
    }
  })
}

module.exports.createGist = async function(githubToken, gistId) {
  const octokit = getOctokit(githubToken)
  const gist = await octokit.gists.create({
    files: {
      'readme.txt': {
        content: 'A game made with www.flickgame.org.  You can import game.txt there to play the game.  Uh, too lazy to describe - HMU at analytic@gmail.com if you want to know how (basically just use the gist ID in the url like other flickgames do...) '
      }
    },
    public: true,
    description: 'Created by flickgame-updater',
  })
  return gist.data.id
}

module.exports.readFromGist = async function(githubToken, gistId) {
  const octokit = getOctokit(githubToken)
  const gist = await octokit.gists.get({
    gist_id: gistId
  })
  return JSON.parse(gist.data.files['game.txt'].content)
}

module.exports.updateToGist = function(githubToken, gistId, content) {
  const octokit = getOctokit(githubToken)
  log('Updating gist...')
  octokit.gists.update({
    gist_id: gistId,
    files: {
      'game.txt': { content }
    }
  }).then(() => {
    log(`Flickgame is updated: https://www.flickgame.org/play.html?p=${gistId}`)
  })
}