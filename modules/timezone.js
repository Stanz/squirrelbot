const bot = require("../lib/bot"),
  moment = require("moment-timezone");

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

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
const convertTo = [
  "Europe/London",
  "Europe/Brussels",
  "America/New_York",
  "America/Edmonton",
];
const re = `((\\d{1,2}):?(\\d{2})?\\s?(PM|AM)?)\\s?(${convertFrom.join("|")})`;
const re1 = new RegExp(re, "gi");
const re2 = new RegExp(re, "i");

let countdowns = {};

bot.on("message", (message) => {
  if (bot.user === message.author) return;
  let matches = message.content.match(re1);
  if (matches && matches.length) {
    let messages = [];
    matches.forEach(function (match) {
      const m = match.match(re2);
      if (m) {
        const now = moment.tz(m[5]);
        let time;
        if (m[1]) {
          let tz;
          switch (m[5].toLowerCase()) {
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
            case "pst":
              tz = "Etc/GMT+8";
              break;
            case "pdt":
              tz = "Etc/GMT+7";
              break;
            case "est":
              tz = "Etc/GMT+5";
              break;
            case "edt":
              tz = "Etc/GMT+4";
              break;
            case "mst":
              tz = "Etc/GMT+7";
              break;
            case "mdt":
              tz = "Etc/GMT+6";
              break;
            case "cst":
              tz = "Etc/GMT+6";
              break;
            case "cdt":
              tz = "Etc/GMT+5";
              break;
            case "cest":
              tz = "Etc/GMT-2";
              break;
            case "cet":
              tz = "Etc/GMT-1";
              break;
            case "gmt":
              tz = "Etc/GMT";
              break;
            case "bst":
              tz = "Etc/GMT-1";
              break;
            case "utc":
              tz = "Etc/UTC";
              break;
          }
          if (!tz) {
            messages.push("Invalid timezone");
            return;
          }
          let obj = {
            year: now.year(),
            month: now.month(),
            date: now.date(),
            hour:
              m[4] && m[4].toLowerCase() == "pm" ? parseInt(m[2]) + 12 : m[2],
          };
          //console.log(obj)
          //console.log(tz)
          if (m[3]) obj.minutes = m[3];
          time = moment.tz(obj, tz);
        } else {
          return;
        }
        if (time < now) time = time.add(1, "days");
        messages.push(
          time.fromNow(true) +
            " from now " +
            convertTo
              .map(
                (tz) =>
                  "[" +
                  time.tz(tz).format("HH:mm") +
                  " " +
                  tz.split("/")[1] +
                  "]"
              )
              .join(" ")
        );
      }
    });
    if (messages.length) {
      message.channel.sendMessage(messages.join("\n"));
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
      message.channel.sendMessage("countdown started");
    }
  }
  m = message.content.match(/^!stopcountdown$/);
  if (m && m.length) {
    const channelId = message.channel.id;
    countdowns[channelId] = null;
    message.channel.sendMessage("countdown stopped");
  }
});
