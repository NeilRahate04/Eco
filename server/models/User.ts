import { Document, Schema, model } from 'mongoose';
import { User as IUserSchema } from '@shared/mongodb-schema';

export interface IUser extends Omit<Document, '_id'>, IUserSchema {}

const UserSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  password: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  role: { type: String, required: true, default: 'user', enum: ['user', 'admin'] },
  preferences: {
    preferredTransportTypes: [{ type: String }],
    preferredDestinations: [{ type: String }],
    ecoMode: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    theme: { type: String, default: 'system', enum: ['light', 'dark', 'system'] }
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'users',
  timestamps: true
});

// Remove duplicate index definitions since they're already defined in the schema
// UserSchema.index({ username: 1 });
// UserSchema.index({ email: 1 });

export default model<IUser>('User', UserSchema); 