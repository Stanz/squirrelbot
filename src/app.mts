import bot from "./lib/bot.mjs";
import logger from "./lib/logger.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

bot.on("ready", () => {
  logger.log("info", "Bot Running");
});

// Load our bot modules
(async () => {
  await Promise.all(
    (process.env.SQUIRRELBOT_MODULES || "")
      .split(" ")
      .filter(Boolean)
      .map((file) => {
        const module = import(path.join(__dirname, "modules", file));
        logger.log("info", `Module loaded: ${file}`);
        return module;
      })
  );
})();

logger.log("info", "All modules loaded");
