const showColleagueKeyboardPassenger = async (ctx) => {
  await ctx.reply('Выберите действие:', {
    reply_markup: {
      keyboard: [
        [{ text: '🚗 Забронировать место' }],
        [{ text: '❌ Отменить бронь' }],
        [{ text: '📋 Показать мои брони' }],
        [{ text: '🚙 Показать водителей' }],
        [{ text: '🔙 Назад' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const showPassengerTaxiKeyboard = async (ctx) => {
  await ctx.reply('Выберите действие:', {
    reply_markup: {
      keyboard: [
        [{ text: '🚕 Забронировать место в такси' }],
        [{ text: '❌ Отменить бронь в такси' }],
        [{ text: '👥 Показать моих попутчиков как пассажир' }],
        [{ text: '🔙 Назад' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const showPassengerOrderedTaxiKeyboard = async (ctx) => {
  await ctx.reply('Выберите действие:', {
    reply_markup: {
      keyboard: [
        [{ text: '🚖 Подбросить на такси' }],
        [{ text: '❌ Отменить запрос' }],
        [{ text: '🚗 Показать мое такси' }],
        [{ text: '👥 Показать моих попутчиков' }],
        [{ text: '🔙 Назад' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const showTaxiKeyboard = async (ctx) => {
  await ctx.reply('Выберите действие:', {
    reply_markup: {
      keyboard: [
        [{ text: '🚖 Заказывающий' }],
        [{ text: '🚕 Пассажир' }],
        [{ text: '🔙 Назад' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const showMainMenuPassenger = async (ctx) => {
  await ctx.reply('Меню:', {
    reply_markup: {
      keyboard: [
        [{ text: '🚗 Коллега - водитель' }],
        [{ text: '🚕 Такси' }],
        [{ text: '👤 Мой профиль' }],
        [{ text: 'ℹ️ О боте' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const showUserProfileMenu = async (ctx) => {
  await ctx.reply('Выберите действие: ', {
    reply_markup: {
      keyboard: [
        [{ text: '👤 Показать профиль' }],
        [{ text: '✏️ Изменить профиль' }],
        [{ text: '🔙 Назад' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const showMainMenuDrivers = async (ctx) => {
  await ctx.reply('Меню:', {
    reply_markup: {
      keyboard: [
        [{ text: '🚗 Показать моих пассажиров' }],
        [{ text: '👤 Мой профиль' }],
        [{ text: 'ℹ️ О боте' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

export {
  showColleagueKeyboardPassenger,
  showTaxiKeyboard,
  showMainMenuPassenger,
  showUserProfileMenu,
  showMainMenuDrivers,
  showPassengerOrderedTaxiKeyboard,
  showPassengerTaxiKeyboard,
};
