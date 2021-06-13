const bot = require("../lib/bot"),
  youtubeStream = require("youtube-audio-stream"),
  ytdl = require("ytdl-core");

let voiceConnection;
const streamOptions = { seek: 0, volume: 0.5, passes: 2 };
let dispatcher;

bot.on("message", (message) => {
  if (bot.user === message.author) return;
  let matches = message.content.match(/^!joinme$/);
  if (matches && matches.length) {
    message.guild.channels
      .filter((channel) => channel.type === "voice")
      .forEach(function (channel) {
        if (
          channel.members
            .map((member) => member.user.id)
            .indexOf(message.author.id) > -1
        ) {
          channel.join().then(function (connection) {
            voiceConnection = connection;
          });
        }
      });
  }
  if (voiceConnection) {
    matches = message.content.match(/^!ytOLD (.*)$/);
    if (matches && matches.length) {
      console.log("playing");
      let chosenFormat;
      const stream = ytdl(matches[1], {
        filter: function (format) {
          if (format.audioEncoding === "aac" && /audio\//.test(format.type)) {
            chosenFormat = format;
            return true;
          }
          return false;
        },
      });
      dispatcher = voiceConnection.playStream(stream, streamOptions);
      message.reply(
        "playing [" +
          chosenFormat.audioEncoding +
          "/" +
          chosenFormat.audioBitrate +
          "k]"
      );
    }
    matches = message.content.match(/^!yt (.*)$/);
    if (matches && matches.length) {
      const stream = youtubeStream(matches[1]);
      dispatcher = voiceConnection.playStream(stream, streamOptions);
    }
    matches = message.content.match(/^!pause$/);
    if (matches && matches.length) {
      dispatcher.pause();
    }
    matches = message.content.match(/^!resume$/);
    if (matches && matches.length) {
      dispatcher.resume();
    }
    matches = message.content.match(/^!stop$/);
    if (matches && matches.length) {
      dispatcher.end();
    }
    matches = message.content.match(/^!volume (.*)$/);
    if (matches && matches.length) {
      dispatcher.setVolume(parseInt(matches[1]) / 100);
    }
  }
});
