import bot from "../lib/bot.mjs";
import logger from "../lib/logger.mjs";
import OpenExchangeRates from "oxr";
import fx from "money";

const oxr = OpenExchangeRates.factory({
  appId: process.env.OPEN_EXCHANGE_RATES_APP_ID,
});

const getRates = async function getRates() {
  const result = await oxr.latest();
  logger.info("Refreshed exchange rates");
  fx.rates = result.rates;
  fx.base = result.base;
};

setInterval(getRates, 60 * 60 * 1000);
getRates();

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const convertFrom = [
  "GBP",
  "EUR",
  "USD",
  "NOK",
  "SEK",
  "CAD",
  "CNY",
  "RMB",
  "BTC",
  "XBT",
];
const convertTo = ["GBP", "EUR", "USD", "NOK", "BTC"];
const symbolMap = {
  "€": "EUR",
  $: "USD",
  "£": "GBP",
  "¥": "CNY",
  Ƀ: "BTC",
  "฿": "BTC",
  "﹩": "CAD",
};
const re =
  "(\\b|" +
  Object.keys(symbolMap)
    .map((s) => escapeRegExp(s))
    .join("|") +
  ")([+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:,[0-9]{3})*(?:\\.[0-9]{2})?|(?:\\.[0-9]{3})*(?:,[0-9]{2})?|(k)))\\s{0,1}(" +
  convertFrom.join("|") +
  ")?\\b";
const re1 = new RegExp(re, "gi");
const re2 = new RegExp(re, "i");

bot.on("messageCreate", (message) => {
  if (bot.user === message.author) return;
  let matches = message.content.match(re1);
  if (matches && matches.length) {
    let messages = [];
    matches.forEach(function (match) {
      const m = match.match(re2);
      if (m) {
        const currency =
          (m[4] && m[4].toUpperCase()) || (m[1] && symbolMap[m[1]]);
        if (currency) {
          let figure = m[3] ? +m[2].match(/(.*)[k|K]/)[1] * 1000 : m[2];
          if (
            /\d{1,3},\d{2}$/.test(`${figure}`) ||
            /\b\d{1,3}\.\d{3}\b/.test(`${figure}`)
          ) {
            figure = `${figure}`.replace(/(\.|,)/g, function (match) {
              if (match == ",") return ".";
              if (match == ".") return ",";
            });
          }
          function convertCurrency(figure, from, to) {
            if (from == "XBT") from = "BTC";
            if (to == "XBT") to = "BTC";
            let value = fx(figure).from(from).to(to);
            if (to == "BTC" && value < 1) {
              to = "mBTC";
              value = value * 1000;
            }
            return value.toFixed(2) + " " + to;
          }
          messages.push(
            convertCurrency(figure, currency, currency) +
              " = [" +
              convertTo
                .filter((c) => c !== currency)
                .map((c) => convertCurrency(figure, currency, c))
                .join(" | ") +
              "]"
          );
        }
      }
    });
    if (messages.length) {
      message.channel.send(messages.join("\n"));
    }
  }
});
