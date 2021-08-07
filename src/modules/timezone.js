const bot = require("../lib/bot");
const moment = require("moment-timezone");
const nlp = require("compromise");
nlp.extend(require("compromise-dates"));
nlp.extend(require("compromise-numbers"));

const convertFrom = [
  "PST",
  "MST",
  "CST",
  "EST",
  "PDT",
  "MDT",
  "CDT",
  "EDT",
  "GMT",
  "UTC",
  "CET",
  "BST",
  "CEST",
  "PT",
  "ET",
  "CT",
  "MT",
];
const re = `((\\d{1,2}):?(\\d{2})?\\s?(PM|AM)?)\\s?(${convertFrom.join("|")})`;
const re1 = new RegExp(re, "gi");

let countdowns = {};

bot.on("message", (message) => {
  if (bot.user === message.author) return;
  let matches = message.content.match(re1);
  if (matches && matches.length) {
    let messages = [];
    let doc = nlp(message.content);
    let dates = doc.dates().json();
    dates.forEach(function (date) {
      let acronyms = doc.acronyms().json();
      let tz;
      if (acronyms.length) {
        switch (acronyms[0].text.toLowerCase()) {
          case "pt":
            tz = "US/Pacific";
            break;
          case "et":
            tz = "US/Eastern";
            break;
          case "ct":
            tz = "US/Central";
            break;
          case "mt":
            tz = "US/Mountain";
            break;
        }
      }
      time = tz
        ? moment.tz(moment(date.start).format("YYYY-MM-DDTHH:mm:ss"), tz)
        : moment(date.start);
      if (time < moment()) {
        messages.push(`${time.toNow(true)} ago <t:${time.format("X")}:F>`);
      } else {
        messages.push(
          `${time.fromNow(true)} from now <t:${time.format("X")}:F>`
        );
      }
    });
    if (messages.length) {
      message.channel.send(messages.join("\n"));
    }
  }
  m = message.content.match(/^!countdown (.*)$/);
  if (m && m.length) {
    let date = moment(m[1]);
    if (!date.isValid()) {
      console.log(moment().format("YYYY-MM-DD") + " " + m[1]);
      date = moment(moment().format("YYYY-MM-DD") + " " + m[1]);
      if (date.toDate() < moment().toDate()) date = date.add(1, "days");
    }
    const channelId = message.channel.id;
    if (date) {
      function updateDate() {
        console.log(countdowns);
        if (countdowns[channelId]) {
          if (countdowns[channelId] != date.fromNow()) {
            countdowns[channelId] = date.fromNow();
            message.channel.setTopic(countdowns[channelId]);
          }
          setTimeout(function () {
            updateDate();
          }, 1000);
        }
      }
      console.log(channelId);
      countdowns[channelId] = date.fromNow();
      message.channel.setTopic(countdowns[channelId]);
      updateDate();
      message.channel.send("countdown started");
    }
  }
  m = message.content.match(/^!stopcountdown$/);
  if (m && m.length) {
    const channelId = message.channel.id;
    countdowns[channelId] = null;
    message.channel.send("countdown stopped");
  }
});
