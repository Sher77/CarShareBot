const { completeRegistration } = require('./utils/utils');

const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
const carRegex = /^[A-Za-z0-9\s-]+$/;
const ageRegex = /^\d{1,2}$/;

async function validateName(ctx) {
  const name = ctx.message.text.trim();

  if (!name) {
    await ctx.reply('Пожалуйста, введите корректное имя.');
    return;
  }

  ctx.session.userData.name = name;
  ctx.session.registrationStep = 'ask_phone_number';
  await ctx.reply('Введите ваш номер телефона:');
}

async function validatePhoneNumber(ctx) {
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

async function validateCar(ctx) {
  const car = ctx.message.text.trim();

  if (!carRegex.test(car)) {
    await ctx.reply('Пожалуйста, введите корректную информацию о машине.');
    return;
  }

  ctx.session.userData.car = car;
  ctx.session.registrationStep = 'ask_age';
  await ctx.reply('Введите ваш возраст:');
}

async function validateAge(ctx) {
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

module.exports = {
  validateName,
  validatePhoneNumber,
  validateCar,
  validateAge,
};
