import { User, TaxiRequest } from '../db/collections.js';

import bot from '../bot.js';

const reserveTaxiCallback = async (data, ctx) => {
  if (data === 'reserve_taxi_cancel') {
    await ctx.editMessageText('Вы решили не бронировать место!');
    return;
  }

  if (data.startsWith('reserve_taxi_')) {
    const taxiRequestId = data.split('_')[2];

    try {
      const taxiRequest = await TaxiRequest.findById(taxiRequestId);

      const creator = await User.findOne({ _id: taxiRequest.creatorId });
      const passenger = await User.findOne({ telegramId: ctx.from.id });

      if (!taxiRequest || taxiRequest.status === 'closed') {
        await ctx.reply('Этот запрос на такси больше не актуален.');
        await ctx.editMessageReplyMarkup({
          reply_markup: { inline_keyboard: [] },
        });
        return;
      }

      if (taxiRequest.reservedSeats >= taxiRequest.maxSeats) {
        await ctx.reply('Все места уже забронированы.');
        return;
      }

      if (!passenger) {
        await ctx.reply(
          'Не удалось найти ваш аккаунт для подтверждения бронирования.'
        );
        return;
      }

      taxiRequest.reservedSeats += 1;
      taxiRequest.passengerIds.push(passenger._id);
      await taxiRequest.save();

      if (creator && creator.telegramId) {
        await bot.api.sendMessage(
          creator.telegramId,
          `Пользователь ${
            passenger ? passenger.name : 'Неизвестный'
          } забронировал место в вашем такси.`
        );
      }

      await ctx.reply('Вы успешно забронировали место в такси.');
      await ctx.editMessageText('Вы успешно забронировали место в такси.', {
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.error('Ошибка при бронировании такси:', err.message);
      await ctx.reply('Произошла ошибка при бронировании такси.');
    }
  }
};

export default reserveTaxiCallback;
