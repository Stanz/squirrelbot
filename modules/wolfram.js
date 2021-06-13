const bot = require("../lib/bot"),
  wolfram = require("wolfram").createClient(process.env.WOLFRAM_API_KEY);

function getValue(node) {
  var val = node;
  if (node.subpods) return getValue(node.subpods[0]);
  return val;
}

bot.on("message", (message) => {
  if (bot.user === message.author) return;
  const matches = message.content.match(/^w (.*)$/);
  if (matches && matches.length) {
    wolfram.query(matches[1], function (err, result) {
      if (err) {
        console.error(err);
        return;
      }
      // Find a primary pod
      let filtered = result.filter((pod) => pod.primary);
      // If no primary pod, get any pod that isn't "Input interpration"
      if (!filtered.length)
        filtered = result.filter((pod) => pod.title !== "Input interpretation");
      if (filtered[0]) {
        const val = getValue(filtered[0]);
        let opts = {};
        if (!val.value && val.image)
          opts.embed = {
            url: val.image,
            image: {
              url: val.image,
            },
          };
        console.log(opts);
        message.channel.send(
          filtered[0].title + (val.value ? " - " + val.value : ""),
          opts
        );
        return;
      }
      message.channel.send("I got nothing");
    });
  }
});
