const { Schema, mongoose } = require('mongoose');

const DriverSchema = new Schema({
  driverId: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  age: { type: String, required: true },
  car: { type: String, required: true },
  seats: {
    front: { type: Boolean, default: true },
    left: { type: Boolean, default: true },
    center: { type: Boolean, default: true },
    right: { type: Boolean, default: true },
  },
  passengers: {
    front: { type: String, default: '' },
    left: { type: String, default: '' },
    center: { type: String, default: '' },
    right: { type: String, default: '' },
  },
});

const Driver = mongoose.model('Driver', DriverSchema);

const UserReservationSchema = new Schema({
  userId: { type: String, required: true },
  driverId: { type: Number, required: true },
  seat: {
    type: String,
    enum: ['front', 'left', 'center', 'right'],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const UserReservation = mongoose.model(
  'UserReservation',
  UserReservationSchema
);

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

const taxiRequestSchema = new mongoose.Schema({
  passengerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pickupLocation: String,
  dropoffLocation: String,
  maxSeats: { type: Number, default: 3 },
  reservedSeats: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const TaxiRequest = mongoose.model('TaxiRequest', taxiRequestSchema);

const insertUserData = async (data) => {
  try {
    const user = new User({ ...data });
    await user.save();
    console.log('Данные пользователя сохранены!');
  } catch (err) {
    console.error('Ошибка при сохранении данных пользователя!', err.message);
  }
};

module.exports = {
  DriverSchema,
  Driver,
  UserReservationSchema,
  UserReservation,
  User,
  userSchema,
  TaxiRequest,
  insertUserData,
};
