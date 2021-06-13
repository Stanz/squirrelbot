const bot = require("../lib/bot"),
  client = require("../lib/hearthstone")(process.env.HEARTHSTONE_API_KEY);

bot.on("message", (message) => {
  if (bot.user === message.author) return;
  const matches = message.content.match(/^hs (.*)$/);
  if (matches && matches.length) {
    client.searchCard(matches[1]).then(function (cards) {
      message.channel.sendMessage(
        cards.length
          ? cards
              .slice(0, 3)
              .map((card) => card.img)
              .join("\n")
          : "Not Found"
      );
    });
  }
});
