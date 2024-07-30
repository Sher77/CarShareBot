import 'dotenv/config';

import { connectToDb, clearReservations } from './src/db/index.js';
import cron from 'node-cron';
import bot from './src/bot.js';
import { startBot } from './src/startBot.js';

const start = async () => {
  try {
    await connectToDb('CarShareBot');
    console.log('Успешно подключено!');

    try {
      await bot.api.deleteWebhook();
      console.log('Webhook удален.');
    } catch (error) {
      console.error('Ошибка удаления вебхука:', error);
    }

    const webhookUrl = 'https://car-share-bot.railway.app/webhook';
    console.log('Попытка установить вебхук на URL:', webhookUrl);
    try {
      await bot.api.setWebhook(webhookUrl);
      console.log('Webhook установлен:', webhookUrl);
    } catch (error) {
      console.error('Ошибка установки вебхука:', error);
    }

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
};

start().catch(console.error);
