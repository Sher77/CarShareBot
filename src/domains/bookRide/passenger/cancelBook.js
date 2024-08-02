import { UserReservation, Driver } from '../../../db/collections.js';
import { InlineKeyboard } from 'grammy';
import { seatMapping } from '../../../utils/utils.js';

const cancelBook = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    const userId = ctx.from.id;

    const reservations = await UserReservation.find({ userId });

    if (reservations.length === 0) {
      return ctx.reply('У вас нет активных броней.');
    }

    const cancelKeyboard = new InlineKeyboard();

    for (const reservation of reservations) {
      const driver = await Driver.findOne({ driverId: reservation.driverId });
      const driverSeat = seatMapping[reservation.seat];

      if (driver) {
        cancelKeyboard
          .text(
            `Отменить ${driverSeat} у ${driver.name}`,
            `cancel_${reservation._id}`
          )
          .row();
      } else {
        cancelKeyboard
          .text(
            `Отменить ${seatMapping[reservation.seat]} у неизвестного`,
            `cancel_${reservation._id}`
          )
          .row();
      }
    }

    cancelKeyboard.text('Отмена', `cancel_book_${userId}`);

    await ctx.reply('Выберите бронирование для отмены:', {
      reply_markup: cancelKeyboard,
    });
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { cancelBook };
