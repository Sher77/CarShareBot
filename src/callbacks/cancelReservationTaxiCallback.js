import { TaxiRequest, User } from '../db/collections.js';

import bot from '../bot.js';

const cancelReservationTaxiCallback = async (data, ctx) => {
  if (data.startsWith('taxi_cancel_')) {
    const reservationId = data.split('_')[2];

    try {
      const user = await User.findOne({ telegramId: ctx.from.id });
      const taxiRequest = await TaxiRequest.findById(reservationId);

      if (!taxiRequest || taxiRequest.status === 'closed') {
        await ctx.reply('Это запрос такси уже закрыт!');
        return;
      }

      const passengerIndex = taxiRequest.passengerIds.indexOf(user._id);
      if (passengerIndex === -1) {
        await ctx.editMessageText('Вы не забронировали место в этом такси.', {
          reply_markup: { inline_keyboard: [] },
        });
        return;
      }

      taxiRequest.passengerIds.splice(passengerIndex, 1);
      taxiRequest.reservedSeats -= 1;
      await taxiRequest.save();

      await ctx.editMessageText('Вы успешно отменили бронировани.');

      const creator = await User.findById(taxiRequest.creatorId);

      if (creator && creator.telegramId) {
        bot.api.sendMessage(
          creator.telegramId,
          `Пользователь ${user.name} отменил бронирование в вашем такси.`
        );
      }
    } catch (err) {
      console.error('Ошибка отмены брони в такси:', err.message);
      await ctx.reply('Ошибка отмены брони в такси.');
    }
  }
};

export default cancelReservationTaxiCallback;
