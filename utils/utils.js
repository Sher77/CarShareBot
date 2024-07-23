const { Driver, User } = require('../database/models');
const { UserReservation } = require('../database/models');
const { connectToDb } = require('../database/db');
const { insertUserData } = require('../database/models');
const {
  commands,
  commandsForDrivers,
  commandsForPassengers,
} = require('../commands');

const completeRegistration = async (ctx) => {
  try {
    await connectToDb('CarShareBot');

    const userId = ctx.from.id;
    const newRole = ctx.session.role;
    const userData = ctx.session.userData;

    console.log('User ID:', userId);
    console.log('New Role:', newRole);
    console.log('User Data:', userData);

    ctx.session.userData = { ...userData, role: newRole }; // Обновляем userData

    const existingUser = await User.findOne({ telegramId: userId });

    if (existingUser) {
      await User.findOneAndUpdate(
        { telegramId: userId },
        { role: newRole, ...ctx.session.userData },
        { new: true }
      );

      console.log('User updated in DB');

      ctx.session.isLoggedIn = true;
      ctx.session.role = newRole;

      console.log('Session after update:', ctx.session);

      if (newRole === 'driver') {
        const existingDriver = await Driver.findOne({ driverId: userId });
        if (existingDriver) {
          await Driver.findOneAndUpdate(
            { driverId: userId },
            { role: newRole, ...ctx.session.userData },
            { new: true }
          );
          console.log('Driver updated in DB');
        } else {
          const newDriver = new Driver({
            driverId: userId,
            role: newRole,
            ...ctx.session.userData,
          });
          await newDriver.save();
          console.log('New driver saved in DB');
        }
      } else {
        await Driver.findOneAndDelete({ driverId: userId });
        console.log('Driver deleted from DB');
      }

      await ctx.reply('Ваши данные обновлены. Добро пожаловать обратно!');
    } else {
      const newUser = await insertUserData({
        role: newRole,
        telegramId: userId,
        ...ctx.session.userData,
      });

      console.log('New user created in DB');

      ctx.session.isLoggedIn = true;
      ctx.session.userData = {
        telegramId: userId,
        role: newRole,
        ...ctx.session.userData,
      };
      ctx.session.role = newRole;

      if (newRole === 'driver') {
        const newDriver = new Driver({
          driverId: userId,
          role: newRole,
          ...ctx.session.userData,
        });

        await newDriver.save();
        console.log('New driver saved in DB');
        await ctx.reply('Вы успешно зарегистрировались как водитель.');
      } else {
        await ctx.reply('Вы успешно зарегистрировались как пассажир.');
      }
    }
  } catch (err) {
    console.error('Ошибка: ', err.message);
    await ctx.reply('Произошла ошибка при регистрации. Попробуйте еще раз.');
  }
};

const bookSeat = async (ctx, driverId, seat, ruSeat) => {
  try {
    const driver = await Driver.findOne({ driverId: Number(driverId) });

    if (!driver) {
      return ctx.reply('Водитель не найден!');
    }

    if (!driver.seats[seat]) {
      return ctx.reply('Место уже занято или недоступно!');
    }

    driver.seats[seat] = false;
    driver.passengers[seat] = ctx.from.username;

    await driver.save();

    await createReservation(ctx.from.id, driverId, seat);

    await ctx.editMessageText(
      `Место ${ruSeat} успешно забронировано у водителя ${driver.name}!`
    );
  } catch (err) {
    console.error('Ошибка при бронировании места:', err.message);
    await ctx.reply('Произошла ошибка при бронировании места.');
  }
};

const createReservation = async (userId, driverId, seat) => {
  try {
    const driver = await Driver.findOne({ driverId: driverId });

    if (!driver) {
      console.error('Водитель не найден:', driverId);
      throw new Error('Водитель не найден.');
    }

    if (!driver.seats[seat]) {
      console.error('Место уже занято или недоступно:', seat);
      throw new Error('Место уже занято или недоступно.');
    }

    const reservation = new UserReservation({
      userId: userId,
      driverId: driverId,
      seat: seat,
    });

    await reservation.save();
    console.log('Бронь успешно сохранена:', reservation);
    return reservation;
  } catch (err) {
    console.error('Ошибка при сохранении брони:', err.message);
    throw new Error('Произошла ошибка при сохранении брони.');
  }
};

module.exports = {
  bookSeat,
  createReservation,
  completeRegistration,
};
