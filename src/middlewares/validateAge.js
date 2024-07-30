import { completeRegistration } from '../domains/registration/completeRegistration.js';

const ageRegex = /^\d{1,2}$/;

export default async function validateAge(ctx) {
  const age = ctx.message.text.trim();

  if (
    !ageRegex.test(age) ||
    parseInt(age, 10) < 18 ||
    parseInt(age, 10) > 100
  ) {
    await ctx.reply('Пожалуйста, введите корректный возраст.');
    return;
  }

  ctx.session.userData.age = parseInt(age, 10);
  await completeRegistration(ctx);
}
