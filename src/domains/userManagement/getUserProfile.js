import { User, Driver } from '../../db/collections.js';

const showUserProfile = async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  const driver = await Driver.findOne({ driverId: user.telegramId });

  if (ctx.session.role === 'passenger') {
    ctx.reply(
      `📋 Ваш профиль 📋

Привет, ${user.name}!

Вот информация о вашем профиле:

👤 Имя: ${user.name}
📞 Телефон: ${user.phone}
👥 Роль: пассажир 

Спасибо, что вы с нами!
        `
    );
  } else if (ctx.session.role === 'driver') {
    ctx.reply(
      `📋  Ваш профиль 📋

Привет, ${driver.name}!

Вот информация о вашем профиле:

👤 Имя: ${driver.name}
📞 Телефон: ${driver.phone}
🚗 Автомобиль: ${driver.car}
🔢 Возраст: ${driver.age}
🚙Роль: водитель

Спасибо, что вы с нами!
`
    );
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { showUserProfile };
