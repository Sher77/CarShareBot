import { InlineKeyboard } from 'grammy';
import { Driver } from '../../../db/collections.js';
import { seatMapping } from '../../../utils/utils.js';

const removePassenger = async (ctx) => {
  if (ctx.session.role === 'driver') {
    try {
      const driverId = ctx.from.id;
      const driver = await Driver.findOne({ driverId });

      if (!driver) {
        return await ctx.reply('Ошибка: водитель не найден!');
      }

      const passengersKeyboard = new InlineKeyboard();

      Object.keys(driver.passengers).forEach((seat) => {
        if (driver.passengers[seat]) {
          passengersKeyboard
            .text(
              `${seatMapping[seat]}: ${driver.passengers[seat]}`,
              `remove_${seat}`
            )
            .row();
        }
      });

      passengersKeyboard.text('Отмена', 'cancel_remove');

      if (passengersKeyboard.inline_keyboard.length - 1 > 0) {
        await ctx.reply('Выберите пассажира, которого хотите удалить:', {
          reply_markup: passengersKeyboard,
        });
      } else {
        await ctx.reply('На данный момент пассажиров нет.');
      }
    } catch (error) {
      console.error('Ошибка при удалении пассажира:', error);
      await ctx.reply('Произошла ошибка при удалении пассажира.');
    }
  } else if (ctx.session.role === 'passenger') {
    await ctx.reply('Команда только для водителей');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { removePassenger };
