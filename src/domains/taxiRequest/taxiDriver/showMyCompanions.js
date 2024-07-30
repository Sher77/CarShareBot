import { User, TaxiRequest } from '../../../db/collections.js';

const showMyCompanions = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });

      const taxiRequests = await TaxiRequest.find({
        creatorId: user._id,
        status: 'open',
      });

      if (taxiRequests.length === 0) {
        await ctx.reply('У вас нет активных запросов такси.');
        return;
      }

      let companionsList = '';

      for (const taxiRequest of taxiRequests) {
        let requestCompanions = '';

        for (const passengerId of taxiRequest.passengerIds) {
          const passenger = await User.findById(passengerId);

          if (passenger) {
            requestCompanions += `- ${passenger.name}\n`;
          }
        }

        if (requestCompanions) {
          companionsList += `Попутчики с ${taxiRequest.pickupLocation} до ${taxiRequest.dropoffLocation}:\n${requestCompanions}\n`;
        }
      }

      if (companionsList) {
        await ctx.reply(companionsList);
      } else {
        await ctx.reply('У вас пока нет попутчиков.');
      }
    } catch (err) {
      console.error('Ошибка получения попутчиков: ', err.message);
      await ctx.reply('Ошибка с получением списка попутчиков.');
    }
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { showMyCompanions };
