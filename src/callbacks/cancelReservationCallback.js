import { UserReservation, Driver } from '../db/collections.js';

import { sendNotification } from '../utils/utils.js';

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

export default cancelReservationCallback;
