import { Document, Schema, model } from 'mongoose';
import { TransportOption as ITransportOptionSchema } from '@shared/mongodb-schema';

export interface ITransportOption extends Omit<Document, '_id'>, ITransportOptionSchema {}

const TransportOptionSchema = new Schema<ITransportOption>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  icon: { type: String, required: true },
  carbonPerKm: { type: Number, required: true },
  carbonCategory: { type: String, required: true },
  colorClass: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<ITransportOption>('TransportOption', TransportOptionSchema); 