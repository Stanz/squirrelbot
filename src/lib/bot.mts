import { Client, GatewayIntentBits } from "discord.js";
import logger from "./logger.mjs";

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

bot.on("disconnect", function () {
  logger.info("bot disconnected");
});

bot.on("error", function (err) {
  logger.error(err);
});

bot.login(process.env.DISCORD_TOKEN);

export default bot;
