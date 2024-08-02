import { Driver } from '../../../db/collections.js';

const myPassengers = async (ctx) => {
  if (ctx.session.role === 'driver') {
    try {
      const driver = await Driver.findOne({ driverId: ctx.from.id });

      if (!driver) {
        return await ctx.reply('Водитель не найден.');
      }

      const seatMapping = {
        front: 'спереди',
        left: 'слева',
        center: 'посередине',
        right: 'справа',
      };

      const occupiedSeats = Object.keys(driver.seats).filter(
        (seat) => !driver.seats[seat]
      );

      if (occupiedSeats.length === 0) {
        return await ctx.reply('Нет занятых мест.');
      }

      let response = `Занятые места:\n\n`;

      occupiedSeats.forEach((seat) => {
        console.log(seat, driver.passengers[seat], driver);

        response += `Место ${seatMapping[seat]}: ${
          driver.passengers[seat] || 'Неизвестный пассажир'
        }\n`;
      });

      await ctx.reply(response);
    } catch (error) {
      console.error('Ошибка при получении информации о пассажирах:', error);
      await ctx.reply(
        'Произошла ошибка при получении информации о пассажирах.'
      );
    }
  } else if (ctx.session.role === 'passenger') {
    await ctx.reply('Команда только для водителей');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { myPassengers };
