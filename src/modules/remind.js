const bot = require("../lib/bot"),
  Sugar = require("sugar-date"),
  moment = require("moment"),
  schedule = require("node-schedule");

bot.on("message", (message) => {
  if (bot.user === message.author) return;
  let matches = message.content.match(/^r (.*)$/);
  if (matches && matches.length) {
    matches = matches[1].match(/^(.*)\.(.*)$/);
    const dateString = matches[1]
      .replace("mins", "minutes")
      .replace("secs", "seconds");
    let date = Sugar.Date.create(dateString);
    const reminder = matches[2];
    if (!new Sugar.Date(date).isValid().raw)
      date = Sugar.Date.create("in " + dateString);
    console.log(date);
    console.log(reminder);
    if (!reminder) {
      message.channel.sendMessage("Format: !remind date. reminder");
    } else if (!new Sugar.Date(date).isValid().raw) {
      message.channel.sendMessage("Invalid Date");
    } else if (moment().isAfter(date)) {
      message.channel.sendMessage("Date is in the past");
    } else if (moment().add(10, "days").isBefore(date)) {
      message.channel.sendMessage("Date is too far in the future");
    } else {
      schedule.scheduleJob(
        date,
        function (r) {
          message.channel.sendMessage("Reminder: " + r);
        }.bind(null, reminder)
      );
      message.channel.sendMessage(
        "Reminder Created for: " + moment(date).format("YYYY-MM-DD HH:mm:ss")
      );
      //message.channel.sendMessage('Reminder Created for: '+date.long())
    }
  }
});
