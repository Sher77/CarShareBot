import { User } from '../db/User/index.js';
import { UserReservation } from '../db/UserReservation/index.js';
import { Driver } from '../db/Driver/index.js';

import { Bot } from 'grammy';
const bot = new Bot(process.env.BOT_API_TOKEN);

const sendNotification = async (userId, message) => {
  try {
    await bot.api.sendMessage(userId, message);
  } catch (err) {
    console.error('Ошибка отправки уведомления:', err);
  }
};

const bookSeat = async (ctx, driverId, seat, ruSeat) => {
  const seatMapping = {
    front: 'спереди',
    left: 'слева',
    center: 'посередине',
    right: 'справа',
  };

  try {
    const driver = await Driver.findOne({ driverId });

    if (!driver) {
      return ctx.reply('Водитель не найден!');
    }

    if (!driver.seats[seat]) {
      return ctx.reply('Место уже занято или недоступно!');
    }

    driver.seats[seat] = false;
    driver.passengers[seat] = ctx.from.username;

    await driver.save();

    await ctx.editMessageText(
      `Место ${ruSeat} успешно забронировано у водителя ${driver.name}!`
    );

    const user = await User.find({ telegramId: ctx.from.id });

    sendNotification(
      driverId,
      `У вас забронировали место ${seatMapping[seat]}: ${user[0].name}`
    );
  } catch (err) {
    console.error('Ошибка при бронировании места:', err);
    await ctx.reply('Произошла ошибка при бронировании места.');
  }
};

const createReservation = async (userId, driverId, seat) => {
  try {
    const reservation = new UserReservation({
      userId: userId,
      driverId: driverId,
      seat: seat,
    });

    await reservation.save();
    return reservation;
  } catch (err) {
    console.error('Ошибка при сохранении брони:', err);
    throw new Error('Произошла ошибка при сохранении брони.');
  }
};

export { bookSeat, createReservation, sendNotification };