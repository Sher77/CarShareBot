const {
  Driver,
  UserReservation,
  TaxiRequest,
  User,
} = require('../database/models');
const { InlineKeyboard } = require('grammy');
const { bookSeat } = require('../utils/utils');

const { createReservation, sendNotification } = require('../utils/utils');

const bot = require('../bot');

const pickDriverCallback = async (data, ctx) => {
  if (data.startsWith('picked_driver_')) {
    const driverId = Number(data.split('_')[2]);

    try {
      const driver = await Driver.findOne({ driverId });

      if (!driver) {
        return ctx.reply('Водитель не найден');
      }

      const availableSeats = [];

      if (driver.seats.front) availableSeats.push('спереди');
      if (driver.seats.left) availableSeats.push('слева');
      if (driver.seats.center) availableSeats.push('посередине');
      if (driver.seats.right) availableSeats.push('справа');

      if (availableSeats.length === 0) {
        return ctx.reply('У выбранного водителя нет свободных мест!');
      }

      const bookKeyboard = new InlineKeyboard();

      availableSeats.forEach((seat) => {
        bookKeyboard.text(seat, `${seat}_${driver.driverId}`);
      });

      await ctx.editMessageText('Свобoдные места у водителя:  ', {
        reply_markup: bookKeyboard,
      });
    } catch (err) {
      console.error('Ошибка при поиске водителей:', err);
      await ctx.reply('Произошла ошибка при поиске водителей.');
    }
  } else if (data.includes('_')) {
    const [seat, driverId] = data.split('_');

    const seatMapping = {
      спереди: 'front',
      слева: 'left',
      посередине: 'center',
      справа: 'right',
    };

    const englishSeat = seatMapping[seat];

    if (englishSeat) {
      try {
        await bookSeat(ctx, Number(driverId), englishSeat, seat);

        const reservation = await createReservation(
          ctx.from.id,
          Number(driverId),
          englishSeat
        );

        await ctx.reply(`Вы успешно забронировали место ${seat} у водителя.`);
      } catch (err) {
        console.error('Ошибка при бронировании места:', err);
        await ctx.reply('Произошла ошибка бронирования места.');
      }
    }
  }
};

const cancelReservationCallback = async (data, ctx) => {
  const seatMapping = {
    front: 'спереди',
    left: 'слева',
    center: 'посередине',
    right: 'справа',
  };
  if (data.startsWith('cancel_')) {
    const reservationId = data.split('_')[1];

    try {
      const reservation = await UserReservation.findById(reservationId);

      if (!reservation) {
        return ctx.reply('Бронирование не найдено.');
      }

      await UserReservation.findByIdAndDelete(reservationId);

      const driver = await Driver.findOne({ driverId: reservation.driverId });

      if (!driver) {
        return ctx.reply('Водитель не найден');
      }

      const seat = reservation.seat;

      sendNotification(
        driver.driverId,
        ` ${driver.passengers[seat]} отменил у Вас бронь ${seatMapping[seat]}:`
      );

      driver.seats[seat] = true;
      driver.passengers[seat] = '';

      await driver.save();

      await ctx.editMessageText(
        `Бронирование успешно отменено у водителя ${driver.name}`
      );
    } catch (err) {
      console.error('Ошибка при отмене бронирования:', err);
      await ctx.reply('Произошла ошибка при отмене бронирования.');
    }
  }
};

const reserveTaxi = async (data, ctx) => {
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

      await ctx.editMessageText('Вы успешно забронировали место в такси.', {
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.error('Ошибка при бронировании такси:', err.message);
      await ctx.reply('Произошла ошибка при бронировании такси.');
    }
  }
};

const closeTaxiRequest = async (data, ctx) => {
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

        console.log(passenger);

        if (passenger && passenger.telegramId) {
          try {
            await bot.api.sendMessage(
              passenger.telegramId,
              'Запрос на такси был закрыт владельцем.'
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
        await bot.api.sendMessage(
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

module.exports = {
  pickDriverCallback,
  cancelReservationCallback,
  reserveTaxi,
  closeTaxiRequest,
  cancelReservationTaxiCallback,
  bookTaxiCallback,
};
