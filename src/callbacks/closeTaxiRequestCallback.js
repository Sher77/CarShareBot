import { User, TaxiRequest } from '../db/collections.js';

import bot from '../bot.js';
import { sendNotification } from '../utils/utils.js';

const closeTaxiRequestCallback = async (data, ctx) => {
  if (data === 'close_cancel') {
    await ctx.editMessageText('Вы решили не отменять запрос на такси.');
    return;
  }

  if (data.startsWith('close_')) {
    const taxiRequestId = data.split('_')[1];

    try {
      const taxiRequest = await TaxiRequest.findById(taxiRequestId);

      if (!taxiRequest || taxiRequest.status === 'closed') {
        await ctx.reply('Этот запрос на такси уже закрыт.');
        return;
      }

      taxiRequest.status = 'closed';
      await taxiRequest.save();

      for (const passengerId of taxiRequest.passengerIds) {
        const passenger = await User.findById(passengerId);

        if (passenger && passenger.telegramId) {
          try {
            sendNotification(
              passenger.telegramId,
              `Запрос на такси был закрыт владельцем: с ${taxiRequest.pickupLocation} до ${taxiRequest.dropoffLocation}.`
            );
          } catch (sendMessageError) {
            console.error(
              `Ошибка при отправке сообщения пользователю ${passenger.telegramId}:`,
              sendMessageError.message
            );
          }
        } else {
          console.error(
            `Пользователь с ID ${passengerId} не найден или не имеет telegramId.`
          );
        }
      }

      await ctx.editMessageText('Запрос на такси был закрыт.');
    } catch (error) {
      console.error('Ошибка при закрытии запроса на такси:', error.message);
      await ctx.reply('Произошла ошибка при закрытии запроса на такси.');
    }
  }
};

export default closeTaxiRequestCallback;
