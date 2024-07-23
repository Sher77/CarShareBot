require('dotenv').config();
const mongoose = require('mongoose');

const { UserReservation, Driver } = require('./models');

let db;

const connectToDb = async (dbName) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: dbName,
    });

    db = mongoose.connection;
  } catch (err) {
    console.error('Ошибка подключения к базе данных: ', err.message);
    throw err;
  }
};

const clearReservations = async () => {
  try {
    const reservations = await UserReservation.find();

    const driverIds = reservations.map((reservation) => reservation.driverId);

    const drivers = await Driver.find({ driverId: { $in: driverIds } });

    await UserReservation.deleteMany({});

    for (const driver of drivers) {
      driver.seats = {
        front: true,
        left: true,
        center: true,
        right: true,
      };
      driver.passengers = {
        front: '',
        left: '',
        center: '',
        right: '',
      };
      await driver.save();
    }

    console.log('База данных успешно очищена!');
  } catch (err) {
    console.error('Ошибка очистки данных: ' + err);
  }
};

module.exports = { connectToDb, clearReservations };
