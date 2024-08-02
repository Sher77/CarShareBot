import { User, TaxiRequest } from '../db/collections.js';

import bot from '../bot.js';
import { sendNotification } from '../utils/utils.js';

const bookTaxiCallback = async (data, ctx) => {
  if (data.startsWith('taxi_book')) {
    const taxiId = data.split('_')[2];

    try {
      const taxiRequest = await TaxiRequest.findById(taxiId);

      if (!taxiRequest || taxiRequest.status === 'closed') {
        await ctx.reply('Этот запрос на такси больше не актуален.');
        await ctx.editMessageReplyMarkup({
          reply_markup: { inline_keyboard: [] },
        });
        return;
      }

      const passenger = await User.findOne({ telegramId: ctx.from.id });

      if (taxiRequest.passengerIds.includes(passenger._id)) {
        await ctx.editMessageText(
          `Вы уже забронировали место в этом такси: с ${taxiRequest.pickupLocation} до ${taxiRequest.dropoffLocation}`
        );
        return;
      }

      taxiRequest.reservedSeats += 1;
      taxiRequest.passengerIds.push(passenger._id);
      await taxiRequest.save();

      const creator = await User.findById(taxiRequest.creatorId);
      if (creator && creator.telegramId) {
        sendNotification(
          creator.telegramId,
          `Пользователь ${passenger.name} забронировал место в вашем такси.`
        );
      }

      await ctx.reply('Вы успешно забронировали место в такси.');
      await ctx.editMessageReplyMarkup({
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.error('Ошибка при бронировании такси: ', err.message);
      await ctx.reply('Произошла ошибка при бронировании такси.');
    }
  }
};

export default bookTaxiCallback;
