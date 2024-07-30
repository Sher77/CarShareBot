import { User, Driver } from '../../../db/collections.js';

import { sendNotification } from '../../../utils/utils.js';

const bookSeat = async (ctx, driverId, seat, ruSeat) => {
  const seatMapping = {
    front: 'спереди',
    left: 'слева',
    center: 'посередине',
    right: 'справа',
  };

  let originalSeatStatus;
  let originalPassenger;

  try {
    const driver = await Driver.findOne({ driverId });

    if (!driver) {
      return ctx.reply('Водитель не найден!');
    }

    if (!driver.seats[seat]) {
      return ctx.reply('Место уже занято или недоступно!');
    }

    originalSeatStatus = driver.seats[seat];
    originalPassenger = driver.passengers[seat];

    driver.seats[seat] = false;

    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      return ctx.reply('Пользователь не найден!');
    }

    driver.passengers[seat] = user.name;
    await driver.save();

    await ctx.editMessageText(
      `Место ${ruSeat} успешно забронировано у водителя ${driver.name}!`
    );

    sendNotification(
      driverId,
      `У вас забронировали место ${seatMapping[seat]}: ${user.name}`
    );
  } catch (err) {
    console.error('Ошибка при бронировании места:', err);

    if (originalSeatStatus !== undefined && originalPassenger !== undefined) {
      const driver = await Driver.findOne({ driverId });
      driver.seats[seat] = originalSeatStatus;
      driver.passengers[seat] = originalPassenger;
      await driver.save();
    }

    await ctx.reply('Произошла ошибка при бронировании места.');
  }
};

export { bookSeat };
