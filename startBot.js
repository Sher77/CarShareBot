const { InlineKeyboard, session } = require('grammy');
const { commands } = require('./commands');

const {
  validateName,
  validatePhoneNumber,
  validateCar,
  validateAge,
} = require('./middlewares');

const {
  pickDriverCallback,
  cancelReservationCallback,
  reserveTaxi,
  closeTaxiRequest,
  cancelReservationTaxiCallback,
  bookTaxiCallback,
} = require('./callbacks/callbacks');

const {
  Driver,
  User,
  UserReservation,
  TaxiRequest,
} = require('./database/models');

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
    const role = ctx.session.role;

    const passengerCommands = `
      /book - Забронировать место в машине
      /cancel_reservation - Отменить бронирование
      /show_profile - Просмотреть профиль
      /show_drivers - Показать водителей
      /my_reservations - Показать ваши текущие бронирования
      /show_my_taxi - Показать мои активные запросы такси
      /show_my_companions - Показать моих попутчиков
      /book_taxi - Забронировать место в такси
      /cancel_taxi_reservation - Отменить бронь в такси
    `;

    const driverCommands = `
      /show_profile - Просмотреть профиль
      /show_my_passengers - Показать моих пассажиров
    `;

    const generalCommands = `
      /start - Запуск бота и начало взаимодействия
      /help - Показать это сообщение с описанием команд
    `;

    const response = `
      Привет! Я бот для бронирования мест в машине на пути домой. Вот список доступных команд:
  
      ${generalCommands}
      
      ${role === 'passenger' ? passengerCommands : ''}
      ${role === 'driver' ? driverCommands : ''}
  
      Для бронирования места используйте команду /book и следуйте инструкциям.
  
      Удачи и безопасных поездок!
    `;

    await ctx.reply(response);
  });

  bot.command('my_reservations', async (ctx) => {
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

    await ctx.reply('Введите Ваше имя: ');

    await ctx.editMessageReplyMarkup({
      reply_markup: { inline_keyboard: [] },
    });
  });

  bot.callbackQuery('passenger', async (ctx) => {
    ctx.session.role = 'passenger';
    ctx.session.registrationStep = 'ask_name';

    await ctx.reply('Введите Ваше имя: ');

    await ctx.editMessageReplyMarkup({
      reply_markup: { inline_keyboard: [] },
    });
  });

  bot.command('show_profile', async (ctx) => {
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

  bot.command('show_my_taxi', async (ctx) => {
    if (ctx.session.role === 'passenger') {
      try {
        const user = await User.findOne({ telegramId: ctx.from.id });
        const myTaxiRequests = await TaxiRequest.find({
          creatorId: user._id,
          status: 'open',
        });

        if (myTaxiRequests.length === 0) {
          await ctx.reply('У вас нет активных запросов такси.');
          return;
        }

        const myTaxiKeyboard = new InlineKeyboard();

        for (const request of myTaxiRequests) {
          myTaxiKeyboard
            .text(
              `С ${request.pickupLocation} до ${request.dropoffLocation}`,
              `close_${request._id}`
            )
            .row();
        }

        await ctx.reply('Выберите для отмены запроса такси: ', {
          reply_markup: myTaxiKeyboard,
        });
      } catch (error) {
        console.error(
          'Ошибка при получении моих запросов такси:',
          error.message
        );
        await ctx.reply('Ошибка при получении моих запросов такси.');
      }
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
    }
  });

  bot.command('show_my_companions', async (ctx) => {
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
  });

  bot.command('show_my_companions_as_passenger', async (ctx) => {
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
  });

  bot.command('book', async (ctx) => {
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

  bot.command('book_taxi', async (ctx) => {
    if (ctx.session.role === 'passenger') {
      try {
        const user = await User.findOne({ telegramId: ctx.from.id });
        const activeTaxis = await TaxiRequest.find({
          creatorId: { $ne: user._id },
          status: 'open',
        });

        if (activeTaxis.length === 0) {
          await ctx.reply('На данный момент нет активных такси.');
          return;
        }

        const taxiListKeyboard = new InlineKeyboard();

        for (const taxi of activeTaxis) {
          taxiListKeyboard
            .text(
              `С ${taxi.pickupLocation} до ${taxi.dropoffLocation}`,
              `taxi_book_${taxi._id}`
            )
            .row();
        }

        const message = await ctx.reply(
          'Выберите такси, в котором хотите забронировать место:',
          {
            reply_markup: taxiListKeyboard,
          }
        );

        ctx.session.lastMessageId = message.message_id;
      } catch (err) {
        console.error('Ошибка бронирования места в такси: ', err.message);
        await ctx.reply('Ошибка бронирования места в такси.');
      }
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
    }
  });

  bot.command('cancel_reservation', async (ctx) => {
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

  bot.command('cancel_taxi_reservation', async (ctx) => {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });

      const reservations = await TaxiRequest.find({
        passengerIds: user._id,
        status: 'open',
      });
      console.log(user, reservations);

      if (reservations.length === 0) {
        await ctx.reply('У вас нет активных броней в такси.');
        return;
      }

      const reservationKeyboard = new InlineKeyboard();

      for (const reservation of reservations) {
        reservationKeyboard
          .text(
            `С ${reservation.pickupLocation} до ${reservation.dropoffLocation}`,
            `taxi_cancel_${reservation._id}`
          )
          .row();
      }

      const message = await ctx.reply(
        'Выберите бронь, которую хотите отменить: ',
        {
          reply_markup: reservationKeyboard,
        }
      );

      ctx.session.lastMessageId = message.message_id;
    } catch (err) {
      console.error('Ошибка при получении брони: ', err.message);
      await ctx.reply('Ошибка при получении брони.');
    }
  });

  bot.command('ride_in_a_taxi', async (ctx) => {
    if (ctx.session.role === 'passenger') {
      ctx.session.registrationStep = 'ask_pickup_location';
      await ctx.reply('Введите место отправления: ');
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров!');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
    }
  });

  bot.command('close_taxi_request', async (ctx) => {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });

      const taxiRequests = await TaxiRequest.find({
        creatorId: user._id,
        status: 'open',
      });

      console.log(user, taxiRequests);

      if (taxiRequests.length === 0) {
        await ctx.reply('У вас нет открытых запросов на такси.');
        return;
      }

      const taxiRequestKeyboard = new InlineKeyboard();
      taxiRequests.forEach((request) => {
        taxiRequestKeyboard
          .text(
            `С ${request.pickupLocation} до ${request.dropoffLocation}`,
            `close_${request._id}`
          )
          .row();
      });

      const message = await ctx.reply(
        'Выберите запрос, который хотите закрыть: ',
        {
          reply_markup: taxiRequestKeyboard,
        }
      );

      ctx.session.lastMessageId = message.message_id;
    } catch (err) {
      console.error('Ошибка закрытия запроса такси', err.message);
      await ctx.reply('Ошибка с закрытием на запрос такси.');
    }
  });

  bot.on('callback_query:data', async (ctx) => {
    if (ctx.session.role === 'passenger') {
      const data = ctx.callbackQuery.data;

      pickDriverCallback(data, ctx);
      cancelReservationCallback(data, ctx);
      reserveTaxi(data, ctx);
      closeTaxiRequest(data, ctx);
      cancelReservationTaxiCallback(data, ctx);
      bookTaxiCallback(data, ctx);
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистироваться!');
    }
  });

  bot.on('message', async (ctx) => {
    const currentStep = ctx.session.registrationStep;
    const role = ctx.session.role;

    if (role === 'passenger') {
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
            `${passenger.name} может Вас подбросить:\nМесто отправления: ${ctx.session.taxiRequest.pickupLocation}\nМесто назначения: ${ctx.session.taxiRequest.dropoffLocation}\n`
          );

          await bot.api.sendMessage(
            passenger.telegramId,
            ' Нажмите на кнопку, чтобы забронировать место',
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Забронировать место',
                      callback_data: `reserve_taxi_${newTaxiRequest._id}`,
                    },
                  ],
                ],
              },
            }
          );
        }

        await ctx.reply(
          'Ваш запрос на такси создан. Пассажиры будут уведомлены.'
        );
        ctx.session.registrationStep = null;
        delete ctx.session.taxiRequest;
      } else if (currentStep === 'ask_name') {
        await validateName(ctx);
      } else if (currentStep === 'ask_phone_number') {
        await validatePhoneNumber(ctx);
      }
    } else if (role === 'driver') {
      if (currentStep === 'ask_name') {
        await validateName(ctx);
      } else if (currentStep === 'ask_phone_number') {
        await validatePhoneNumber(ctx);
      } else if (currentStep === 'ask_car') {
        await validateCar(ctx);
      } else if (currentStep === 'ask_age') {
        await validateAge(ctx);
      }
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
    }
  });

  bot.start();
};

module.exports = { startBot };
