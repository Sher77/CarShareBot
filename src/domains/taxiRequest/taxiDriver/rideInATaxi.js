const rideInATaxi = async (ctx) => {
  if (ctx.session.role === 'passenger') {
    ctx.session.registrationStep = 'ask_pickup_location';
    await ctx.reply('Введите место отправления: ');
  } else if (ctx.session.role === 'driver') {
    await ctx.reply('Команда только для пассажиров!');
  } else {
    await ctx.reply('Для начала необходимо войти или зарегистрироваться!');
  }
};

export { rideInATaxi };
