import mongoose from 'mongoose';

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

export { TaxiRequest };
