import { Document, Schema, model } from 'mongoose';

export interface ITransport extends Document {
  name: string;
  type: string;
  carbonPerKm: number; // grams of CO2 per passenger per kilometer
  description: string;
  icon: string;
  colorClass: string;
}

const TransportSchema = new Schema<ITransport>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  carbonPerKm: { type: Number, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  colorClass: { type: String, required: true }
});

export default model<ITransport>('Transport', TransportSchema); 