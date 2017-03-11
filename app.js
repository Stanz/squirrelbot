const config = require('./config'),
      oxr = require('open-exchange-rates'),
      fx = require('money'),
      winston = require('winston'),
      fs = require('fs'),
      path = require('path')

const bot = require('./lib/bot')

// Load our bot modules
fs.readdirSync(path.join(__dirname,'modules')).filter(file => path.extname(file) == '.js').forEach(function (file) {
  require(path.join(__dirname,'modules',file));
})

bot.on('ready', () => {
  winston.log('info', 'Bot Running');
})