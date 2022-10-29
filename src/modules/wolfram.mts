import bot from "../lib/bot.mjs";
import WolframAlphaAPI from "wolfram-alpha-node";

const wolfram = WolframAlphaAPI(process.env.WOLFRAM_API_KEY);

function getValue(node) {
  var val = node;
  if (node.subpods) return getValue(node.subpods[0]);
  return val;
}

bot.on("message", async (message) => {
  if (bot.user === message.author) return;
  const matches = message.content.match(/^w (.*)$/);
  if (matches && matches.length) {
    const result = await wolfram.getFull(matches[1]);
    // Find a primary pod
    let filtered = result.pods.filter((pod) => pod.primary);
    // If no primary pod, get any pod that isn't "Input interpration"
    if (!filtered.length)
      filtered = result.pods.filter(
        (pod) => pod.title !== "Input interpretation"
      );
    if (filtered[0]) {
      const val = getValue(filtered[0]);
      let opts = {};
      if (!val.plaintext && val.img)
        opts.embed = {
          url: val.img.src,
          image: {
            url: val.img.src,
          },
        };
      console.log(opts);
      message.channel.send(
        filtered[0].title + (val.plaintext ? " - " + val.plaintext : ""),
        opts
      );
      return;
    }
    message.channel.send("I got nothing");
  }
});
