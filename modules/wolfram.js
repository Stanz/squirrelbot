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
      let filtered
      filtered = result.filter(pod => pod.primary)
      if (filtered[0]) {
        message.channel.sendMessage(filtered[0].title + ' - ' + getValue(filtered[0]))
        return
      }
      filtered = result.filter(pod => pod.title !== 'Input interpretation')
      if (filtered[0]) {
        message.channel.sendMessage(filtered[0].title + ' - ' + getValue(filtered[0]))
        return
      }
      message.channel.sendMessage('I got nothing')
    })
  }
})