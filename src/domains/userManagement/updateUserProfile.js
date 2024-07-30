import { InlineKeyboard } from 'grammy';

import { User, Driver } from '../../db/collections.js';

const updateUserProfile = async (ctx) => {
  const startKeyboard = new InlineKeyboard()
    .text('Водитель', 'driver')
    .text('Пассажир', 'passenger');

  const user = await User.findOne({ telegramId: ctx.from.id });
  const driver = await Driver.findOne({ driverId: ctx.from.id });

  const textForPassenger = `🔄 Обновление профиля 🔄

      Привет, ${user?.name}!

      Мы заметили, что вы хотите обновить ваш профиль. Ваши текущие данные:

      👤 Имя: ${user?.name}
      📞 Телефон: ${user?.phone}

      Спасибо, что вы с нами!`;

  const textForDriver = `🔄 Обновление профиля 🔄

  Привет, ${driver?.name}!

  Мы заметили, что вы хотите обновить ваш профиль. Ваши текущие данные:

  👤 Имя: ${driver?.name}
  📞 Телефон: ${driver?.phone}
  🚗 Автомобиль: ${driver?.car}
  🔢 Возраст: ${driver?.age}

  Спасибо, что вы с нами!`;

  await ctx.reply(
    ctx.session.role === 'driver'
      ? textForDriver
      : ctx.session.role === 'passenger'
      ? textForPassenger
      : 'Необходимо войти или зарегистрироваться!',
    {
      reply_markup: startKeyboard,
    }
  );
};

export { updateUserProfile };
