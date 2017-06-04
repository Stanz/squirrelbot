const Discord = require('discord.js'),
      config = require('../config'),
      winston = require('winston')

const bot = new Discord.Client() 

bot.on('disconnect', function() {
  winston.info('bot disconnected')
})

bot.on('error', function(err) {
  winston.error(err)
})

bot.login(config.discord && config.discord.token)

module.exports = bot