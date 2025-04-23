import { z } from "zod";
import { Types } from "mongoose";

// User schemas
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const userSchema = insertUserSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  preferences: z.object({
    preferredTransportTypes: z.array(z.string()).optional(),
    preferredDestinations: z.array(z.string()).optional(),
    ecoMode: z.boolean().optional(),
    notificationsEnabled: z.boolean().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
  }).optional(),
  createdAt: z.date(),
});

// Destination schemas
export const insertDestinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().url("Invalid image URL"),
  rating: z.number().int().min(1).max(5),
  ecoCertified: z.boolean().default(false),
  carbonImpact: z.string(),
  carbonScore: z.number().int().min(0).max(100),
});

export const destinationSchema = insertDestinationSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
});

// Transport option schemas
export const insertTransportOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  icon: z.string().min(1, "Icon is required"),
  carbonPerKm: z.number().min(0),
  carbonCategory: z.string(),
  colorClass: z.string(),
});

export const transportOptionSchema = insertTransportOptionSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
});

// Trip schemas
export const insertTripSchema = z.object({
  userId: z.instanceof(Types.ObjectId),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
  departureDate: z.date(),
  transportOptionId: z.instanceof(Types.ObjectId).optional(),
  distance: z.number().min(0),
  carbonFootprint: z.number().min(0),
  duration: z.number().min(0),
});

export const tripSchema = insertTripSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
});

// Carbon record schemas
export const insertCarbonRecordSchema = z.object({
  userId: z.instanceof(Types.ObjectId),
  tripId: z.instanceof(Types.ObjectId).optional(),
  footprintValue: z.number().min(0),
  details: z.any(),
});

export const carbonRecordSchema = insertCarbonRecordSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
});

// Listing schemas
export const insertListingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  ecoScore: z.number().int().min(0).max(100),
  images: z.array(z.string().url("Invalid image URL")),
});

export const listingSchema = insertListingSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
});

// Review schemas
export const insertReviewSchema = z.object({
  userId: z.instanceof(Types.ObjectId),
  serviceType: z.enum(["destination", "transport", "listing"]),
  serviceId: z.instanceof(Types.ObjectId),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1, "Review text is required"),
  approved: z.boolean().default(false),
});

export const reviewSchema = insertReviewSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  createdAt: z.date(),
});

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User preferences schema
export const userPreferencesSchema = z.object({
  preferredTransportTypes: z.array(z.string()).optional(),
  preferredDestinations: z.array(z.string()).optional(),
  ecoMode: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

// Trip search schema
export const tripSearchSchema = z.object({
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
  departureDate: z.date(),
  transportOptionId: z.instanceof(Types.ObjectId).optional(),
});

// Carbon calculation schema
export const carbonCalcSchema = z.object({
  distance: z.number().min(0),
  transportOptionId: z.instanceof(Types.ObjectId),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = z.infer<typeof destinationSchema>;

export type InsertTransportOption = z.infer<typeof insertTransportOptionSchema>;
export type TransportOption = z.infer<typeof transportOptionSchema>;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = z.infer<typeof tripSchema>;

export type InsertCarbonRecord = z.infer<typeof insertCarbonRecordSchema>;
export type CarbonRecord = z.infer<typeof carbonRecordSchema>;

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = z.infer<typeof listingSchema>;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = z.infer<typeof reviewSchema>;

export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export type TripSearch = z.infer<typeof tripSearchSchema>;
export type CarbonCalc = z.infer<typeof carbonCalcSchema>; 