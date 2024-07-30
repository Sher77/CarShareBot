import { User, TaxiRequest } from '../../../db/collections.js';

import bot from '../../../bot.js';

const handleTaxiRequestCreation = async (ctx) => {
  const currentStep = ctx.session.registrationStep;

  if (currentStep === 'ask_pickup_location') {
    ctx.session.taxiRequest = {
      pickupLocation: ctx.message.text.trim(),
    };
    ctx.session.registrationStep = 'ask_dropoff_location';
    return await ctx.reply('Введите место назначения: ');
  } else if (currentStep === 'ask_dropoff_location') {
    ctx.session.taxiRequest.dropoffLocation = ctx.message.text.trim();

    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      return await ctx.reply('Пользователь не найден.');
    }

    const newTaxiRequest = new TaxiRequest({
      creatorId: user._id,
      pickupLocation: ctx.session.taxiRequest.pickupLocation,
      dropoffLocation: ctx.session.taxiRequest.dropoffLocation,
      passengerIds: [],
    });

    await newTaxiRequest.save();

    const allPassengers = await User.find({
      role: 'passenger',
      telegramId: { $ne: ctx.from.id },
    });

    for (const passenger of allPassengers) {
      await bot.api.sendMessage(
        passenger.telegramId,
        `${user.name} может Вас подбросить:\nМесто отправления: ${ctx.session.taxiRequest.pickupLocation}\nМесто назначения: ${ctx.session.taxiRequest.dropoffLocation}\n`
      );

      await bot.api.sendMessage(
        passenger.telegramId,
        'Нажмите на кнопку, чтобы забронировать место',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Забронировать место',
                  callback_data: `reserve_taxi_${newTaxiRequest._id}`,
                },
              ],
              [
                {
                  text: 'Отмена',
                  callback_data: 'reserve_taxi_cancel',
                },
              ],
            ],
          },
        }
      );
    }

    await ctx.reply('Ваш запрос на такси создан. Пассажиры будут уведомлены.');
    ctx.session.registrationStep = null;
    delete ctx.session.taxiRequest;
  }
};

export { handleTaxiRequestCreation };
