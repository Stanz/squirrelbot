const bot = require('../lib/bot'),
      config = require('../config'),
      sugar = require('sugar-date'),
      moment = require('moment'),
      schedule = require('node-schedule')

bot.on('message', message => {
  if (bot.user === message.author) return
  const matches = message.content.match(/^r (.*)$/)
  if (matches && matches.length) {
    const matches = matches[1].match(/^(.*).(.*)$/)
    const date = sugar.create(matches[1], { setUTC: true })
    const reminder = matches[2]
    if (!reminder || !date) {
      message.channel.sendMessage('Format: !remind date. reminder')
    } else {
      schedule.scheduleJob(date,function() {
        message.channel.sendMessage('Reminder: '+reminder)
      })
      //message.channel.sendMessage('Reminder Created for: '+moment(date).format('YYYY-MM-DD HH:mm:ss'))
      message.channel.sendMessage('Reminder Created for: '+date.long())
    }
  }
})