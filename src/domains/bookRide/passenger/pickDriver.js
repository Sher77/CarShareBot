import { Driver } from '../../../db/collections.js';
import { InlineKeyboard } from 'grammy';

const pickDriver = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const drivers = await Driver.find();

      const driversWithFreeSeats = drivers.filter((driver) => {
        return (
          driver.seats.front ||
          driver.seats.left ||
          driver.seats.center ||
          driver.seats.right
        );
      });

      if (driversWithFreeSeats.length === 0) {
        await ctx.reply(
          'К сожалению, нет доступных водителей со свободными местами.'
        );
        return;
      }

      const driversKeyboard = new InlineKeyboard();

      driversWithFreeSeats.forEach((driver) => {
        driversKeyboard
          .text(driver.name, `picked_driver_${driver.driverId}`)
          .row();
      });

      driversKeyboard.text('Отмена', 'picked_driver_cancel');

      const message = await ctx.reply('Водители со свободными местами: ', {
        reply_markup: driversKeyboard,
      });

      ctx.session.lastMessageId = message.message_id;
    } catch (error) {
      console.error('Ошибка при получении водителей:', error.message);
      await ctx.reply('Произошла ошибка при получении списка водителей.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { pickDriver };
