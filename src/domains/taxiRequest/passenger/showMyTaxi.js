import { User, TaxiRequest } from '../../../db/collections.js';

import { InlineKeyboard } from 'grammy';

const showMyTaxi = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });
      const myTaxiRequests = await TaxiRequest.find({
        creatorId: user._id,
        status: 'open',
      });

      if (myTaxiRequests.length === 0) {
        await ctx.reply('У вас нет активных запросов такси.');
        return;
      }

      const myTaxiKeyboard = new InlineKeyboard();

      for (const request of myTaxiRequests) {
        myTaxiKeyboard
          .text(
            `С ${request.pickupLocation} до ${request.dropoffLocation}`,
            `close_${request._id}`
          )
          .row();
      }

      myTaxiKeyboard.text('Отмена', 'close_cancel');

      await ctx.reply('Выберите для отмены запроса такси: ', {
        reply_markup: myTaxiKeyboard,
      });
    } catch (error) {
      console.error('Ошибка при получении моих запросов такси:', error.message);
      await ctx.reply('Ошибка при получении моих запросов такси.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { showMyTaxi };
