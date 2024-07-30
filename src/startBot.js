import { InlineKeyboard, Keyboard, session } from 'grammy';
import { commands } from './commands/commands.js';

import {
  pickDriverCallback,
  cancelReservationCallback,
  reserveTaxiCallback,
  closeTaxiRequestCallback,
  cancelReservationTaxiCallback,
  bookTaxiCallback,
} from './callbacks/index.js';

import {
  handlePassengerRegistration,
  handleDriverRegistration,
} from './domains/registration/registerUser.js';
import { handleTaxiRequestCreation } from './domains/taxiRequest/taxiDriver/createTaxiRequest.js';
import { rideInATaxi } from './domains/taxiRequest/taxiDriver/rideInATaxi.js';
import { showUserProfile } from './domains/userManagement/getUserProfile.js';
import { updateUserProfile } from './domains/userManagement/updateUserProfile.js';
import { closeTaxiRequest } from './domains/taxiRequest/taxiDriver/closeTaxiRequest.js';
import { bookTaxi } from './domains/taxiRequest/passenger/bookTaxi.js';
import { cancelBookTaxi } from './domains/taxiRequest/passenger/cancelBookTaxi.js';
import { showMyTaxi } from './domains/taxiRequest/passenger/showMyTaxi.js';
import { showMyCompanions } from './domains/taxiRequest/taxiDriver/showMyCompanions.js';
import { myReservations } from './domains/bookRide/passenger/myReservations.js';
import { myPassengers } from './domains/bookRide/driver/myPassengers.js';
import { showDrivers } from './domains/bookRide/passenger/showDrivers.js';
import { pickDriver } from './domains/bookRide/passenger/pickDriver.js';
import { cancelBook } from './domains/bookRide/passenger/cancelBook.js';
import { showMyCompanionsAsPassenger } from './domains/taxiRequest/passenger/showMyCompanions.js';
import {
  helpCallback,
  loginOrRegisterCallback,
} from './callbacks/menuCallbacks.js';

import {
  showColleagueKeyboardPassenger,
  showMainMenuDrivers,
  showMainMenuPassenger,
  showPassengerOrderedTaxiKeyboard,
  showPassengerTaxiKeyboard,
  showTaxiKeyboard,
  showUserProfileMenu,
} from './utils/keyboards.js';

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

  bot.command('menu', async (ctx) => {
    const role = ctx.session.role;

    let keyboard;

    if (role === 'driver') {
      keyboard = [
        [{ text: 'Показать моих пассажиров' }],
        [{ text: '👤 Мой профиль' }],
        [{ text: 'ℹ️ О боте' }],
      ];
    } else if (role === 'passenger') {
      keyboard = [
        [{ text: '🚗 Коллега - водитель' }],
        [{ text: '🚕 Такси' }],
        [{ text: '👤 Мой профиль' }],
        [{ text: 'ℹ️ О боте' }],
      ];
    } else {
      keyboard = [[{ text: '🔑 Вход | Регистрация' }], [{ text: 'ℹ️ О боте' }]];
    }

    const message = await ctx.reply('Меню:', {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

    ctx.session.lastMessageId = message.message_id;
  });

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
    helpCallback(ctx);
  });

  bot.command('my_reservations', async (ctx) => {
    myReservations(ctx);
  });

  bot.command('show_my_passengers', async (ctx) => {
    myPassengers(ctx);
  });

  bot.command('show_drivers', async (ctx) => {
    showDrivers(ctx);
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
    showUserProfile(ctx);
  });

  bot.command('update_profile', async (ctx) => {
    updateUserProfile(ctx);
  });

  bot.command('show_my_taxi', async (ctx) => {
    showMyTaxi(ctx);
  });

  bot.command('show_my_companions', async (ctx) => {
    showMyCompanions(ctx);
  });

  bot.command('show_my_companions_as_passenger', async (ctx) => {
    showMyCompanionsAsPassenger(ctx);
  });

  bot.command('book', async (ctx) => {
    pickDriver(ctx);
  });

  bot.command('book_taxi', async (ctx) => {
    bookTaxi(ctx);
  });

  bot.command('cancel_reservation', async (ctx) => {
    cancelBook(ctx);
  });

  bot.command('cancel_book_taxi', async (ctx) => {
    cancelBookTaxi(ctx);
  });

  bot.command('ride_in_a_taxi', async (ctx) => {
    await rideInATaxi(ctx);
  });

  bot.command('close_taxi_request', async (ctx) => {
    closeTaxiRequest(ctx);
  });

  bot.on('callback_query:data', async (ctx) => {
    if (ctx.session.role === 'passenger') {
      const data = ctx.callbackQuery.data;

      pickDriverCallback(data, ctx);
      cancelReservationCallback(data, ctx);
      reserveTaxiCallback(data, ctx);
      closeTaxiRequestCallback(data, ctx);
      cancelReservationTaxiCallback(data, ctx);
      bookTaxiCallback(data, ctx);
    } else if (ctx.session.role === 'driver') {
      await ctx.reply('Команда только для пассажиров');
    } else {
      await ctx.reply('Для начала необходимо войти или зарегистироваться!');
    }
  });

  bot.on('message', async (ctx) => {
    const messageText = ctx.message.text;
    const role = ctx.session.role;
    const currentStep = ctx.session.registrationStep;

    if (role === 'passenger') {
      switch (messageText) {
        case '🚗 Коллега - водитель':
          await showColleagueKeyboardPassenger(ctx);
          break;
        case '🚕 Такси':
          await showTaxiKeyboard(ctx);
          break;
        case '👤 Мой профиль':
          await showUserProfileMenu(ctx);
          break;
        case 'ℹ️ О боте':
          await helpCallback(ctx);
          break;
        case '🔙 Назад':
          await showMainMenuPassenger(ctx);
          break;
        // Обработка кнопок из клавиатур
        case '🚖 Заказывающий':
          await showPassengerOrderedTaxiKeyboard(ctx);
          break;
        case '🚕 Пассажир':
          await showPassengerTaxiKeyboard(ctx);
          break;
        case '🚖 Подбросить на такси':
          await rideInATaxi(ctx);
          break;
        case '❌ Отменить запрос':
          await closeTaxiRequest(ctx);
          break;
        case '👥 Показать моих попутчиков':
          await showMyCompanions(ctx);
          break;
        case '🚗 Забронировать место':
          await pickDriver(ctx);
          break;
        case '❌ Отменить бронь':
          await cancelBook(ctx);
          break;
        case '📋 Показать мои брони':
          await myReservations(ctx);
          break;
        case '🚙 Показать водителей':
          await showDrivers(ctx);
          break;
        case '🚕 Забронировать место в такси':
          await bookTaxi(ctx);
          break;
        case '❌ Отменить бронь в такси':
          await cancelBookTaxi(ctx);
          break;
        case '👥 Показать моих попутчиков как пассажир':
          await showMyCompanionsAsPassenger(ctx);
          break;
        case '🚗 Показать мое такси':
          await showMyTaxi(ctx);
          break;
        case '👤 Показать профиль':
          await showUserProfile(ctx);
          break;
        case '✏️ Изменить профиль':
          await updateUserProfile(ctx);
          break;
        default:
          break;
      }
    } else if (ctx.session.role === 'driver') {
      switch (messageText) {
        case 'Показать моих пассажиров':
          await myPassengers(ctx);
          break;
        case '👤 Мой профиль':
          await showUserProfileMenu(ctx);
          break;
        case 'ℹ️ О боте':
          return helpCallback(ctx);
        case '👤 Показать профиль':
          await showUserProfile(ctx);
          break;
        case '✏️ Изменить профиль':
          await updateUserProfile(ctx);
          break;
        case '🔙 Назад':
          await showMainMenuDrivers(ctx);
          break;
        default:
          break;
      }
    } else {
      switch (messageText) {
        case '🔑 Вход | Регистрация':
          return loginOrRegisterCallback(ctx);
        case 'ℹ️ О боте':
          return helpCallback(ctx);
        default:
          break;
      }
    }

    if (!role) {
      await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
      return;
    }

    if (role === 'passenger') {
      if (
        currentStep === 'ask_pickup_location' ||
        currentStep === 'ask_dropoff_location'
      ) {
        await handleTaxiRequestCreation(ctx);
      } else {
        await handlePassengerRegistration(ctx);
      }
    } else if (role === 'driver') {
      await handleDriverRegistration(ctx);
    }
  });

  bot.start();
};

export { startBot };
