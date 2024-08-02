import { TaxiRequest, User } from '../../../db/collections.js';

const showActiveTaxi = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const taxiRequests = await TaxiRequest.find({ status: 'open' });

      if (taxiRequests.length === 0) {
        return await ctx.reply('На данный момент активных запросов такси нет.');
      }

      let response = 'Активные запросы такси: \n';

      for (const taxiRequest of taxiRequests) {
        const driver = await User.findById(taxiRequest.creatorId);
        response += `
Заказчик такси: ${driver.name}
С ${taxiRequest.pickupLocation} до ${taxiRequest.dropoffLocation} \n`;
      }

      await ctx.reply(response);
    } catch (err) {
      console.error('Ошибка поиска активных такси:', err.message);
      await ctx.reply('Ошибка поиска активных такси.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { showActiveTaxi };
