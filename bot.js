const { InlineKeyboard, session } = require('grammy');
const { commands } = require('./commands');
const { completeRegistration } = require('./utils/utils');

const {
  pickDriverCallback,
  cancelReservationCallback,
} = require('./callbacks/callbacks');

const { Driver, User, UserReservation } = require('./database/models');

const startBot = (bot) => {
  bot.use(
    session({
      initial: () => ({
        userData: {},
        registrationStep: null,
        isLoggedIn: null,
        role: null,
      }),
    })
  );

  bot.api.setMyCommands(commands);

  bot.command('start', async (ctx) => {
    const startKeyboard = new InlineKeyboard()
      .text('Водитель', 'driver')
      .text('Пассажир', 'passenger');

    await ctx.reply(
      `Привет я CarShareBot! 👋

      Добро пожаловать в нашего бота для бронирования мест в машине. 🚗

      Чтобы начать, выберите вашу роль для регистрации. Если у вас есть вопросы, просто напишите(/help), и мы поможем!

      Приятных поездок!`,
      {
        reply_markup: startKeyboard,
      }
    );
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      `Привет! Я бот для бронирования мест в машине на пути домой. Вот список доступных команд:

      /start - Запуск бота и начало взаимодействия
      /help - Показать это сообщение с описанием команд
      /book - Забронировать место в машине
      /cancel_reservation - Отменить бронирование
      /show_profile - Просмотреть профиль
      /show_drivers - Показать водителей
      /my_reservations - Показать ваши текущие бронирования

      Для бронирования места используйте команду /book и следуйте инструкциям.

      Удачи и безопасных поездок!
        `
    );
  });

  bot.command('my_reservations', async (ctx) => {
    console.log('my_reservations' + ctx.session.role);
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
  });

  bot.command('show_my_passengers', async (ctx) => {
    console.log('show_my_passengers' + ctx.session.role);

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

        let response = `Занятые места у водителя ${driver.name}:\n\n`;

        occupiedSeats.forEach((seat) => {
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
  });

  bot.command('show_drivers', async (ctx) => {
    console.log('show_drivers' + ctx.session.role);
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
  });

  bot.callbackQuery('driver', async (ctx) => {
    ctx.session.role = 'driver';
    ctx.session.registrationStep = 'ask_name';

    console.log('Role set to driver:', ctx.session);

    await ctx.editMessageReplyMarkup({ reply_markup: null });
    await ctx.reply('Введите Ваше имя: ');
  });

  bot.callbackQuery('passenger', async (ctx) => {
    ctx.session.role = 'passenger';
    ctx.session.registrationStep = 'ask_name';

    console.log('Role set to passenger:', ctx.session);

    await ctx.editMessageReplyMarkup({ reply_markup: null });
    await ctx.reply('Введите Ваше имя: ');
  });

  bot.command('show_profile', async (ctx) => {
    console.log('cdscmdls');
    console.log('show_profile' + ctx.session.role);
    console.log('Session after handling text:', ctx.session);

    const user = await User.findOne({ telegramId: ctx.from.id });
    const driver = await Driver.findOne({ driverId: user.telegramId });

    if (ctx.session.role === 'passenger') {
      ctx.reply(
        `Профиль:\nИмя: ${user.name}\nТелефон: ${user.phone}\nРоль: пассажир`
      );
    } else if (ctx.session.role === 'driver') {
      ctx.reply(
        `Профиль:\nИмя: ${driver.name}\nТелефон: ${driver.phone}\nРоль: водитель\nВозраст:${driver.age}\nМашина: ${driver.car}`
      );
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
    }
  });

  bot.command('book', async (ctx) => {
    console.log('book ' + ctx.session.role);
    if (ctx.session.role === 'passenger') {
      try {
        const drivers = await Driver.find();

        const driversWithFreeSeats = drivers.filter((driver) => {
          return (
            driver.seats.front ||
            driver.seats.left ||
            driver.seats.center ||
            driver.seats.right
          );
        });

        if (driversWithFreeSeats.length === 0) {
          await ctx.reply(
            'К сожалению, нет доступных водителей со свободными местами.'
          );
          return;
        }

        const driversKeyboard = new InlineKeyboard();

        driversWithFreeSeats.forEach((driver) => {
          driversKeyboard
            .text(driver.name, `picked_driver_${driver.driverId}`)
            .row();
        });

        const message = await ctx.reply('Водители со свободными местами: ', {
          reply_markup: driversKeyboard,
        });

        ctx.session.lastMessageId = message.message_id;
      } catch (error) {
        console.error('Ошибка при получении водителей:', error.message);
        await ctx.reply('Произошла ошибка при получении списка водителей.');
      }
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
    }
  });

  bot.command('cancel_reservation', async (ctx) => {
    console.log('cancel_reservation ' + ctx.session.role);
    if (ctx.session.role === 'passenger') {
      const userId = ctx.from.id;

      const reservations = await UserReservation.find({ userId });

      if (reservations.length === 0) {
        return ctx.reply('У вас нет активных броней.');
      }

      const seatMapping = {
        front: 'спереди',
        left: 'слева',
        center: 'посередине',
        right: 'справа',
      };

      const cancelKeyboard = new InlineKeyboard();

      for (const reservation of reservations) {
        const driver = await Driver.findOne({ driverId: reservation.driverId });

        if (driver) {
          cancelKeyboard
            .text(
              `Отменить ${seatMapping[reservation.seat]} у ${driver.name}`,
              `cancel_${reservation._id}`
            )
            .row();
        } else {
          cancelKeyboard
            .text(
              `Отменить ${seatMapping[reservation.seat]} у неизвестного`,
              `cancel_${reservation._id}`
            )
            .row();
        }
      }

      await ctx.reply('Выберите бронирование для отмены:', {
        reply_markup: cancelKeyboard,
      });
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
    }
  });

  bot.on('callback_query:data', async (ctx) => {
    if (ctx.session.role === 'passenger') {
      const data = ctx.callbackQuery.data;

      pickDriverCallback(data, ctx);
      cancelReservationCallback(data, ctx);
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистироваться!');
    }
  });

  bot.on('message:text', async (ctx) => {
    const userId = ctx.from.id;

    const registrationStep = ctx.session.registrationStep;

    if (registrationStep === 'ask_name') {
      ctx.session.userData = ctx.session.userData || {};
      ctx.session.userData.name = ctx.message.text;
      ctx.session.registrationStep = 'ask_phone';

      await ctx.reply('Введите Ваш номер телефона:');
    } else if (registrationStep === 'ask_phone') {
      ctx.session.userData = ctx.session.userData || {};
      ctx.session.userData.phone = ctx.message.text;

      if (ctx.session.role === 'driver') {
        ctx.session.registrationStep = 'ask_age';
        await ctx.reply('Введите Ваш возраст:');
      } else {
        await completeRegistration(ctx);
      }
    } else if (registrationStep === 'ask_age') {
      ctx.session.userData = ctx.session.userData || {};
      ctx.session.userData.age = ctx.message.text;
      ctx.session.registrationStep = 'ask_car';

      await ctx.reply('Введите марку и модель Вашего автомобиля:');
    } else if (registrationStep === 'ask_car') {
      ctx.session.userData = ctx.session.userData || {};
      ctx.session.userData.car = ctx.message.text;
      await completeRegistration(ctx);
    } else {
      await ctx.reply(
        'Ой >_<. Выберите один из пунктов меню для работы дальше!'
      );
    }
  });

  bot.start();
};

module.exports = { startBot };
