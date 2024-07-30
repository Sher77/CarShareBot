export default async function validateName(ctx) {
  const name = ctx.message.text.trim();

  if (!name) {
    await ctx.reply('Пожалуйста, введите корректное имя.');
    return;
  }

  ctx.session.userData.name = name;
  ctx.session.registrationStep = 'ask_phone_number';
  await ctx.reply('Введите ваш номер телефона:');
}
