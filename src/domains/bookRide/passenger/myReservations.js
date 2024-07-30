import { UserReservation, Driver } from '../../../db/collections.js';

const myReservations = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const reservations = await UserReservation.find();

      const seatMapping = {
        front: 'спереди',
        left: 'слева',
        center: 'посередине',
        right: 'справа',
      };

      let response = '';

      for (const reservation of reservations) {
        const driver = await Driver.findOne({
          driverId: reservation.driverId,
        });

        if (driver) {
          response += `Водитель: ${driver.name}\nМашина: ${
            driver.car
          }\nМесто: ${seatMapping[reservation.seat]}\n\n`;
        } else {
          console.log(
            'Водитель не найден для бронирования с driverId:',
            reservation.driverId
          );
        }
      }

      if (response) {
        await ctx.reply(`Список броней:\n\n ${response}`);
      } else {
        await ctx.reply('У вас нет активных бронирований.');
      }
    } catch (error) {
      console.error('Ошибка при получении списка бронирований:', error);
      await ctx.reply('Произошла ошибка при получении списка бронирований.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистироваться!');
  }
};

export { myReservations };
