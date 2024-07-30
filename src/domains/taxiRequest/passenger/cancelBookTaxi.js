import { User, TaxiRequest } from '../../../db/collections.js';

import { InlineKeyboard } from 'grammy';

const cancelBookTaxi = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });

      const reservations = await TaxiRequest.find({
        passengerIds: user._id,
        status: 'open',
      });
      if (reservations.length === 0) {
        await ctx.reply('У вас нет активных броней в такси.');
        return;
      }

      const reservationKeyboard = new InlineKeyboard();

      for (const reservation of reservations) {
        reservationKeyboard
          .text(
            `С ${reservation.pickupLocation} до ${reservation.dropoffLocation}`,
            `taxi_cancel_${reservation._id}`
          )
          .row();
      }

      const message = await ctx.reply(
        'Выберите бронь, которую хотите отменить: ',
        {
          reply_markup: reservationKeyboard,
        }
      );

      ctx.session.lastMessageId = message.message_id;
    } catch (err) {
      console.error('Ошибка при получении брони: ', err.message);
      await ctx.reply('Ошибка при получении брони.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { cancelBookTaxi };
