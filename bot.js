const { Bot } = require('grammy');
const bot = new Bot(process.env.BOT_API_TOKEN);

module.exports = bot;
