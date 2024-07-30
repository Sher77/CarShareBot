import { User, TaxiRequest } from '../../../db/collections.js';
import { InlineKeyboard } from 'grammy';

const closeTaxiRequest = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });

      const taxiRequests = await TaxiRequest.find({
        creatorId: user._id,
        status: 'open',
      });

      if (taxiRequests.length === 0) {
        await ctx.reply('У вас нет открытых запросов на такси.');
        return;
      }

      const taxiRequestKeyboard = new InlineKeyboard();
      taxiRequests.forEach((request) => {
        taxiRequestKeyboard
          .text(
            `С ${request.pickupLocation} до ${request.dropoffLocation}`,
            `close_${request._id}`
          )
          .row();
      });

      const message = await ctx.reply(
        'Выберите запрос, который хотите закрыть: ',
        {
          reply_markup: taxiRequestKeyboard,
        }
      );

      ctx.session.lastMessageId = message.message_id;
    } catch (err) {
      console.error('Ошибка закрытия запроса такси: ', err.message);
      await ctx.reply('Ошибка с закрытием на запрос такси.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { closeTaxiRequest };
