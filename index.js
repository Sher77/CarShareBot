require('dotenv').config();
const express = require('express');
const { Bot } = require('grammy');
const { connectToDb, clearReservations } = require('./database/db');
const cron = require('node-cron');
const { startBot } = require('./bot');

const app = express();

const bot = new Bot(process.env.BOT_API_TOKEN);

app.use(express.json());
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

module.exports = app;

(async () => {
  try {
    await connectToDb('CarShareBot');
    console.log('Успешно подключено!');

    startBot(bot);

    cron.schedule(
      '0 0 * * *',
      async () => {
        console.log('Запуск очистки базы данных:', new Date().toLocaleString());
        try {
          await clearReservations();
        } catch (error) {
          console.error('Ошибка при очистке базы данных:', error);
        }
      },
      {
        timezone: 'Asia/Almaty',
      }
    );
  } catch (err) {
    console.error('Ошибка при запуске: ', err);
  }
})();