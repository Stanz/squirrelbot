const bot = require('../lib/bot'),
      config = require('../config'),
      wolfram = require('wolfram').createClient(config.modules && config.modules.wolfram && config.modules.wolfram.apiKey)

bot.on('message', message => {
  if (bot.user === message.author) return
  const matches = message.content.match(/^w (.*)$/)
  if (matches && matches.length) {
    wolfram.query(matches[1], function(err, result) {
      if(err) throw err
      message.channel.sendMessage(result)
    })
  }
})