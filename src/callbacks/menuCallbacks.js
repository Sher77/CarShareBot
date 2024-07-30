import { InlineKeyboard } from 'grammy';

const loginOrRegisterCallback = async (ctx) => {
  const startKeyboard = new InlineKeyboard()
    .text('Водитель', 'driver')
    .text('Пассажир', 'passenger');

  await ctx.reply(
    ` Привет я CarShareBot! 👋

      Добро пожаловать в нашего бота для бронирования мест в машине. 🚗

      Чтобы начать, выберите вашу роль для регистрации. Если у вас есть вопросы, просто напишите(/help), и мы поможем!

      Приятных поездок!`,
    {
      reply_markup: startKeyboard,
    }
  );
};

const helpCallback = async (ctx) => {
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
      /cancel_book_taxi - Отменить бронь в такси
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
};

export { helpCallback, loginOrRegisterCallback };
