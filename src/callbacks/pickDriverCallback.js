import { Driver, UserReservation } from '../db/collections.js';
import { InlineKeyboard } from 'grammy';

import { bookSeat } from '../domains/bookRide/passenger/bookSeat.js';

import { createUserReservation } from '../data/UserReservation/index.js';

import { showMainMenuPassenger } from '../utils/keyboards.js';

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

    let reservation;

    if (englishSeat) {
      try {
        await bookSeat(ctx, Number(driverId), englishSeat, seat);

        reservation = await createUserReservation({
          userId: ctx.from.id,
          driverId: Number(driverId),
          seat: englishSeat,
        });
        await ctx.reply(`Вы успешно забронировали место ${seat} у водителя.`);
      } catch (err) {
        console.error('Ошибка при бронировании места:', err);
        await ctx.reply('Произошла ошибка бронирования места.');
      }
    }
  }
};

export default pickDriverCallback;
