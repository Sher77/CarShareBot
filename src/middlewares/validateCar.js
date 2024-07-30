const carRegex = /^[A-Za-z0-9\s-]+$/;

export default async function validateCar(ctx) {
  const car = ctx.message.text.trim();

  if (!carRegex.test(car)) {
    await ctx.reply('Пожалуйста, введите корректную информацию о машине.');
    return;
  }

  ctx.session.userData.car = car;
  ctx.session.registrationStep = 'ask_age';
  await ctx.reply('Введите ваш возраст:');
}
