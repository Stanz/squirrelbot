const Discord = require("discord.js"),
  winston = require("winston");

const bot = new Discord.Client();

bot.on("disconnect", function () {
  winston.info("bot disconnected");
});

bot.on("error", function (err) {
  winston.error(err);
});

bot.login(process.env.DISCORD_TOKEN);

module.exports = bot;
