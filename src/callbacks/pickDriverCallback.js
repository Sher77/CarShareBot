import { Driver, User } from '../db/collections.js';
import { InlineKeyboard } from 'grammy';

import { bookSeat } from '../domains/bookRide/passenger/bookSeat.js';

import { createUserReservation } from '../data/UserReservation/index.js';

import { showMainMenuPassenger } from '../utils/keyboards.js';

import bot from '../bot.js';
import { seatMapping, sendNotification } from '../utils/utils.js';

const pickDriverCallback = async (data, ctx) => {
  if (data === 'picked_driver_cancel') {
    await ctx.editMessageText('Вы отменили выбор водителя.');
    await showMainMenuPassenger(ctx);
    return;
  }

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
        bookKeyboard.text(seat, `${seat}_${driver.driverId}`).row();
      });

      bookKeyboard.text('Отмена', 'seat_driver');

      await ctx.editMessageText('Свобoдные места у водителя:  ', {
        reply_markup: bookKeyboard,
      });
    } catch (err) {
      console.error('Ошибка при поиске водителей:', err);
      await ctx.reply('Произошла ошибка при поиске водителей.');
    }
  } else if (data.includes('_')) {
    if (data === 'seat_driver') {
      await ctx.editMessageText('Вы решили не бронировать место!');
      return;
    }

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
        await sendConfirmationRequest(
          ctx,
          Number(driverId),
          ctx.from.id,
          englishSeat,
          seat
        );
      } catch (err) {
        console.error('Ошибка при бронировании места:', err);
        await ctx.reply('Произошла ошибка бронирования места.');
      }
    }
  }
};

const sendConfirmationRequest = async (
  ctx,
  driverId,
  userId,
  englishSeat,
  seat
) => {
  try {
    const driver = await Driver.findOne({ driverId });
    const user = await User.findOne({ telegramId: driver.driverId });

    if (!driver || !user.telegramId) {
      return await ctx.reply('Водитель не найден или у него нет telegramId.');
    }

    const passengerId = ctx.from.id;

    const confirmKeyboard = new InlineKeyboard()
      .text('Подтвердить', `confirm_${driverId}_${englishSeat}_${userId}`)
      .text('Отклонить', `reject_${driverId}_${englishSeat}_${userId}`);

    const passenger = await User.findOne({ telegramId: passengerId });

    await bot.api.sendMessage(
      user.telegramId,
      `Пассажир ${passenger.name} хочет забронировать место ${seat}. Подтвердить бронирование?`,
      {
        reply_markup: confirmKeyboard,
      }
    );

    await ctx.reply('Запрос на подтверждение бронирования отправлен водителю.');
  } catch (err) {
    console.error(
      'Ошибка при отправке запроса на подтверждение бронирования:',
      err
    );
    await ctx.reply(
      'Произошла ошибка при отправке запроса на подтверждение бронирования.'
    );
  }
};

const handleBookingResponse = async (data, ctx) => {
  if (data.startsWith('confirm_') || data.startsWith('reject_')) {
    const [action, driverId, seat, passengerId] = data.split('_');
    console.log(action, driverId, seat, passengerId);

    try {
      const passenger = await User.findOne({ telegramId: passengerId });

      if (!passenger) {
        return await ctx.reply('Отправитель не найден!');
      }

      if (action === 'confirm') {
        await bookSeat(ctx, Number(driverId), seat, seatMapping[seat]);
        const reservation = await createUserReservation({
          userId: passengerId,
          driverId: Number(driverId),
          seat: seat,
        });
        await ctx.reply(
          `Вы подтвердили бронирование места ${seatMapping[seat]}`
        );
        sendNotification(
          passenger.telegramId,
          `Ваше бронирование места ${seatMapping[seat]} у водителя подтвержено.`
        );
      } else if (action === 'reject') {
        await ctx.reply(`Вы отклонили бронирование места ${seatMapping[seat]}`);
        sendNotification(
          passenger.telegramId,
          `Ваше бронирование места ${seatMapping[seat]} у водителя отклонено.`
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  }
};

export default pickDriverCallback;
export { handleBookingResponse };
