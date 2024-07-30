import { User, TaxiRequest } from '../../../db/collections.js';

const showMyCompanionsAsPassenger = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });

      const taxiRequests = await TaxiRequest.find({
        passengerIds: user._id,
        status: 'open',
      });

      if (taxiRequests.length === 0) {
        await ctx.reply('Вы не забронировали место ни в одном такси.');
        return;
      }

      let companionsList = '';

      for (const taxiRequest of taxiRequests) {
        const creator = await User.findById(taxiRequest.creatorId);

        companionsList += `Запрос такси с ${taxiRequest.pickupLocation} до ${taxiRequest.dropoffLocation}:\n`;
        companionsList += `Создатель: ${
          creator ? creator.name : 'Неизвестный'
        }\n`;
        companionsList += 'Попутчики:\n';

        for (const passengerId of taxiRequest.passengerIds) {
          const passenger = await User.findById(passengerId);
          if (passenger) {
            companionsList += `- ${passenger.name}\n`;
          }
        }
        companionsList += '\n';
      }

      await ctx.reply(companionsList || 'У вас нет попутчиков.');
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

export { showMyCompanionsAsPassenger };
