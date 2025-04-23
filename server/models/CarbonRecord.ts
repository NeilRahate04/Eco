import { Document, Schema, model } from 'mongoose';
import { CarbonRecord as ICarbonRecordSchema } from '@shared/mongodb-schema';

export interface ICarbonRecord extends Omit<Document, '_id'>, ICarbonRecordSchema {}

const CarbonRecordSchema = new Schema<ICarbonRecord>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  tripId: { type: Schema.Types.ObjectId, required: false, ref: 'Trip' },
  footprintValue: { type: Number, required: true },
  details: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default model<ICarbonRecord>('CarbonRecord', CarbonRecordSchema); 