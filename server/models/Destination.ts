import { Document, Schema, model } from 'mongoose';
import { Destination as IDestinationSchema } from '@shared/mongodb-schema';

export interface IDestination extends Omit<Document, '_id'>, IDestinationSchema {}

const DestinationSchema = new Schema<IDestination>({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  image_url: { type: String, required: true },
  rating: { type: Number, required: true },
  ecoCertified: { type: Boolean, required: true, default: false },
  carbonImpact: { type: String, required: true },
  carbonScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IDestination>('Destination', DestinationSchema, 'fsd'); 