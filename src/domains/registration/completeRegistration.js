import { connectToDb } from '../../db/index.js';
import {
  User,
  Driver,
  TaxiRequest,
  UserReservation,
} from '../../db/collections.js';
import { createUser } from '../../data/UserData/index.js';

const completeRegistration = async (ctx) => {
  try {
    await connectToDb('CarShareBot');

    const userId = ctx.from.id;
    const newRole = ctx.session.role;
    const userData = ctx.session.userData;

    ctx.session.userData = { ...userData, role: newRole };

    const existingUser = await User.findOne({ telegramId: userId });

    if (existingUser) {
      const wasDriver = existingUser.role === 'driver';

      await User.findOneAndUpdate(
        { telegramId: userId },
        { role: newRole, ...ctx.session.userData },
        { new: true }
      );

      ctx.session.isLoggedIn = true;
      ctx.session.role = newRole;

      if (newRole === 'driver') {
        if (wasDriver) {
          await Driver.findOneAndUpdate(
            { driverId: userId },
            { role: newRole, ...ctx.session.userData },
            { new: true }
          );
        } else {
          const newDriver = new Driver({
            driverId: userId,
            role: newRole,
            ...ctx.session.userData,
          });
          await newDriver.save();

          await TaxiRequest.deleteMany({ creatorId: existingUser._id });
        }
      } else {
        if (wasDriver) {
          await UserReservation.deleteMany({ driverId: userId });
          await Driver.findOneAndDelete({ driverId: userId });
        }
      }

      await ctx.reply('Ваши данные обновлены. Добро пожаловать обратно!');
    } else {
      const newUser = await createUser({
        role: newRole,
        telegramId: userId,
        ...ctx.session.userData,
      });

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
        await ctx.reply('Вы успешно зарегистрировались как водитель.');
      } else {
        await ctx.reply('Вы успешно зарегистрировались как пассажир.');
      }
    }

    ctx.session.registrationStep = null;
  } catch (err) {
    console.error('Ошибка: ', err.message);
    await ctx.reply('Произошла ошибка при регистрации. Попробуйте еще раз.');
  }
};

export { completeRegistration };
