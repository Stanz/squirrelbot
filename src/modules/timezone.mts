import bot from "../lib/bot.mjs";
import nlp from "../lib/nlp.mjs";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(timezone);
dayjs.extend(relativeTime);

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

bot.on("messageCreate", (message) => {
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
      const time = tz
        ? dayjs.tz(dayjs(date.dates.start).format("YYYY-MM-DDTHH:mm:ss"), tz)
        : dayjs(date.dates.start);
      if (time < dayjs()) {
        messages.push(`${time.toNow(true)} ago <t:${time.unix()}:F>`);
      } else {
        messages.push(`${time.fromNow(true)} from now <t:${time.unix()}:F>`);
      }
    });
    if (messages.length) {
      message.channel.send(messages.join("\n"));
    }
  }
});
