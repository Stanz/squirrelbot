const bot = require('../lib/bot'),
      config = require('../config'),
      oxr = require('open-exchange-rates'),
      fx = require('money')

oxr.set({ app_id: config.modules && config.modules["open-exchange-rates"] && config.modules["open-exchange-rates"].appId })

setInterval(function getRates() {
  oxr.latest(function () {
    fx.rates = oxr.rates
    fx.base = oxr.base
  })
  return getRates
} (), 60 * 60 * 1000)

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const convertFrom = ['GBP', 'EUR', 'USD', 'NOK', 'SEK', 'CAD', 'CNY', 'RMB']
const convertTo = ['GBP', 'EUR', 'USD', 'NOK']
const symbolMap = { "€": "EUR", "$": "USD", "£": "GBP", "¥": 'CNY' }
const re = '(\\b|'+Object.keys(symbolMap).map(s => escapeRegExp(s)).join('|')+')([+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:,[0-9]{3})*(?:\\.[0-9]{2})?|(?:\\.[0-9]{3})*(?:,[0-9]{2})?|(k)))\\s{0,1}('+convertFrom.join('|')+')?\\b';
const re1 = new RegExp(re, 'gi')
const re2 = new RegExp(re, 'i')

bot.on('message', message => {
  if (bot.user === message.author) return
  let matches = message.content.match(re1)
  if (matches && matches.length) {
    let messages = []
    matches.forEach(function (match) {
      const m = match.match(re2)
      if (m) {
        const currency = m[4] && m[4].toUpperCase() || m[1] && symbolMap[m[1]]
        if (currency) {
          let figure = m[3] ? (m[2].match(/(.*)[k|K]/)[1] * 1000) : m[2]
          if (/\d{1,3},\d{2}$/.test(figure) || /\b\d{1,3}\.\d{3}\b/.test(figure)) {
            figure = figure.replace(/(\.|,)/g, function (match) {
              if (match == ',') return '.'
              if (match == '.') return ','
            })
          }
          messages.push(fx(figure).from(currency).to(currency).toFixed(2) + ' ' + currency + ' = [' + convertTo.filter(c => c !== currency).map(c => fx(figure).from(currency).to(c).toFixed(2) + ' ' + c).join(' | ') + ']')
        }
      }
    })
    if (messages.length) {
      message.channel.sendMessage(messages.join('\n'))
    }
  }
})