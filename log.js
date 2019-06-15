const dateFormat = require('dateformat')

module.exports = function log(...args) {
  const time = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  console.log(`[${time}]`, ...args)
}