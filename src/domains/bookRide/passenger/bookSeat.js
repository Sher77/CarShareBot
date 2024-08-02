import { User, Driver } from '../../../db/collections.js';
import { sendNotification, seatMapping } from '../../../utils/utils.js';

const bookSeat = async (ctx, driverId, passenger, seat, ruSeat) => {
  let originalSeatStatus;
  let originalPassenger;
  let originalId;

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
    originalId = driver.ids[seat];

    driver.seats[seat] = false;

    const user = await User.findOne({ telegramId: driverId });
    if (!user) {
      return ctx.reply('Пользователь не найден!');
    }

    driver.passengers[seat] = passenger.name;
    driver.ids[seat] = passenger.telegramId;

    await driver.save();

    // await ctx.reply(`Место ${ruSeat} успешно забронировано!`, {
    //   reply_markup: null,
    // });
    await ctx.editMessageReplyMarkup(null);
    // sendNotification(
    //   driverId,
    //   `У вас забронировали место ${seatMapping[seat]}: ${user.name}`
    // );
  } catch (err) {
    console.error('Ошибка при бронировании места:', err);

    if (originalSeatStatus !== undefined && originalPassenger !== undefined) {
      const driver = await Driver.findOne({ driverId });
      driver.seats[seat] = originalSeatStatus;
      driver.passengers[seat] = originalPassenger;
      driver.ids[seat] = originalId;
      await driver.save();
    }

    await ctx.reply('Произошла ошибка при бронировании места.');
  }
};

export { bookSeat };
