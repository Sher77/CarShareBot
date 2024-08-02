import { Driver, UserReservation } from '../db/collections.js';
import bot from '../bot.js';
import { seatMapping, sendNotification } from '../utils/utils.js';

const removePassengerCallback = async (data, ctx) => {
  if (data === 'cancel_remove') {
    await ctx.editMessageText('Вы отменили удаление пассажира.');
  }

  if (data.startsWith('remove_')) {
    const seat = data.split('_')[1];

    try {
      const driver = await Driver.findOne({ driverId: ctx.from.id });

      if (!driver) {
        return await ctx.reply('Ошибка: водитель не найден!');
      }

      const reservation = await UserReservation.findOne({
        userId: driver.ids[seat],
        seat: seat,
        driverId: driver.driverId,
      });

      if (reservation) {
        await UserReservation.deleteOne({
          userId: driver.ids[seat],
          seat: seat,
          driverId: driver.driverId,
        });
      }
      let passenger = driver.passengers[seat];
      let passengerId = driver.ids[seat];

      driver.seats[seat] = true;
      driver.passengers[seat] = '';
      driver.ids[seat] = null;
      driver.save();

      await ctx.editMessageText(
        `Пассажир ${passenger} был удален с места ${seatMapping[seat]}.`
      );

      sendNotification(
        passengerId,
        `${driver.name} удалил Ваше бронь с места: ${seatMapping[seat]}`
      );

      passenger = null;
      passengerId = null;
    } catch (err) {
      console.error('Ошибка удаления пассажира:', err.message);
      await ctx.reply('Ошибка удаления пассажира.');
    }
  }
};

export { removePassengerCallback };
