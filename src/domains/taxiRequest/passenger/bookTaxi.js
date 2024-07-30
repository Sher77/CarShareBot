import { User, TaxiRequest } from '../../../db/collections.js';

import { InlineKeyboard } from 'grammy';

const bookTaxi = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });
      const activeTaxis = await TaxiRequest.find({
        creatorId: { $ne: user._id },
        status: 'open',
      });

      if (activeTaxis.length === 0) {
        await ctx.reply('На данный момент нет активных такси.');
        return;
      }

      const taxiListKeyboard = new InlineKeyboard();

      for (const taxi of activeTaxis) {
        taxiListKeyboard
          .text(
            `С ${taxi.pickupLocation} до ${taxi.dropoffLocation}`,
            `taxi_book_${taxi._id}`
          )
          .row();
      }

      const message = await ctx.reply(
        'Выберите такси, в котором хотите забронировать место:',
        {
          reply_markup: taxiListKeyboard,
        }
      );

      ctx.session.lastMessageId = message.message_id;
    } catch (err) {
      console.error('Ошибка бронирования места в такси: ', err.message);
      await ctx.reply('Ошибка бронирования места в такси.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { bookTaxi };
