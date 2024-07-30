import { completeRegistration } from '../domains/registration/completeRegistration.js';

const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;

export default async function validatePhoneNumber(ctx) {
  const phoneNumber = ctx.message.text.trim();

  if (!phoneNumberRegex.test(phoneNumber)) {
    await ctx.reply('Пожалуйста, введите корректный номер телефона.');
    return;
  }

  ctx.session.userData.phone = phoneNumber;

  if (ctx.session.role === 'driver') {
    ctx.session.registrationStep = 'ask_car';
    await ctx.reply('Введите информацию о вашей машине:');
  } else {
    await completeRegistration(ctx);
  }
}
