const bot = require('../lib/bot'),
      config = require('../config'),
      wolfram = require('wolfram').createClient(config.modules && config.modules.wolfram && config.modules.wolfram.apiKey)

function getValue(node) {
  var val = node.value
  if (node.subpods) return getValue(node.subpods[0])
  return val
}

bot.on('message', message => {
  if (bot.user === message.author) return
  const matches = message.content.match(/^w (.*)$/)
  if (matches && matches.length) {
    wolfram.query(matches[1], function(err, result) {
      if(err) {
        console.error(err)
        return
      }
      result = result.filter(pod => pod.primary)
      if (result[0]) {
        message.channel.sendMessage(result[0].title + ' - ' + getValue(result[0]))
      } else {
        message.channel.sendMessage('Nothing')
      }
    })
  }
})