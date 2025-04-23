import { Document, Schema, model } from 'mongoose';
import { Listing as IListingSchema } from '@shared/mongodb-schema';

export interface IListing extends Omit<Document, '_id'>, IListingSchema {}

const ListingSchema = new Schema<IListing>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  ecoScore: { type: Number, required: true },
  images: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now }
});

export default model<IListing>('Listing', ListingSchema); 