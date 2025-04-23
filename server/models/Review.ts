import { Document, Schema, model } from 'mongoose';
import { Review as IReviewSchema } from '@shared/mongodb-schema';

export interface IReview extends Omit<Document, '_id'>, IReviewSchema {}

const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  serviceType: { type: String, required: true, enum: ['destination', 'transport', 'listing'] },
  serviceId: { type: Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default model<IReview>('Review', ReviewSchema); 