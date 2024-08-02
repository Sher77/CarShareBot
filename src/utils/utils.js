import { Bot } from 'grammy';
const bot = new Bot(process.env.BOT_API_TOKEN);

const seatMapping = {
  front: 'спереди',
  left: 'слева',
  center: 'посередине',
  right: 'справа',
};

const sendNotification = async (userId, message) => {
  try {
    await bot.api.sendMessage(userId, message);
  } catch (err) {
    console.error('Ошибка отправки уведомления:', err);
  }
};

export { sendNotification, seatMapping };
