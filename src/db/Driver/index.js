import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
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

export { Driver };
