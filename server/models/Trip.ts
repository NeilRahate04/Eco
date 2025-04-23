import { Document, Schema, model } from 'mongoose';
import { Trip as ITripSchema } from '@shared/mongodb-schema';

export interface ITrip extends Omit<Document, '_id'>, ITripSchema {}

const TripSchema = new Schema<ITrip>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  departureDate: { type: Date, required: true },
  transportOptionId: { type: Schema.Types.ObjectId, required: false, ref: 'TransportOption' },
  distance: { type: Number, required: true },
  carbonFootprint: { type: Number, required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<ITrip>('Trip', TripSchema); 