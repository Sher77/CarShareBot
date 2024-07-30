import mongoose from 'mongoose';

const UserReservationSchema = new mongoose.Schema({
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

export { UserReservation };
