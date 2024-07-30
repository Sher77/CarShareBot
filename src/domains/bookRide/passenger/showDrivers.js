import { Driver } from '../../../db/collections.js';

const showDrivers = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const drivers = await Driver.find();
      const driverList = drivers
        .map(
          (driver) =>
            `Имя: ${driver.name},\nТелефон: ${driver.phone},\nМашина: ${driver.car}, \nВозраст: ${driver.age}`
        )
        .join('\n\n');

      if (driverList.length === 0) {
        return ctx.reply(
          'К сожалению на данный момент нет свободных мест или водителей >_<'
        );
      }

      await ctx.reply(`Список водителей:\n\n${driverList}`);
    } catch (error) {
      console.error('Ошибка при получении списка водителей:', error);
      await ctx.reply('Произошла ошибка при получении списка водителей.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистироваться!');
  }
};

export { showDrivers };
