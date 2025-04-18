import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  preferences: jsonb("preferences"), // user preferences
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

// Destinations table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url").notNull(),
  rating: integer("rating").notNull(),
  ecoCertified: boolean("eco_certified").notNull().default(false),
  carbonImpact: text("carbon_impact").notNull(),
  carbonScore: integer("carbon_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
  createdAt: true,
});

// Transportation Options
export const transportOptions = pgTable("transport_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // train, bus, car, plane, etc.
  icon: text("icon").notNull(),
  carbonPerKm: integer("carbon_per_km").notNull(), // grams of CO2 per kilometer
  carbonCategory: text("carbon_category").notNull(), // low, medium, high
  colorClass: text("color_class").notNull(), // for UI styling (success, warning, error)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransportOptionSchema = createInsertSchema(transportOptions).omit({
  id: true,
  createdAt: true,
});

// Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  departureDate: timestamp("departure_date").notNull(),
  transportOptionId: integer("transport_option_id").references(() => transportOptions.id),
  distance: integer("distance").notNull(), // in kilometers
  carbonFootprint: integer("carbon_footprint").notNull(), // total grams of CO2
  duration: integer("duration").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
});

// Carbon Records table
export const carbonRecords = pgTable("carbon_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tripId: integer("trip_id").references(() => trips.id),
  footprintValue: integer("footprint_value").notNull(), // in grams of CO2
  details: jsonb("details"), // details about the carbon calculation
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCarbonRecordSchema = createInsertSchema(carbonRecords).omit({
  id: true,
  createdAt: true,
});

// Listings table (for accommodations, activities, etc.)
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // accommodation, activity, etc.
  description: text("description").notNull(),
  location: text("location").notNull(),
  ecoScore: integer("eco_score").notNull(),
  images: text("images").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceType: text("service_type").notNull(), // destination, transport, listing
  serviceId: integer("service_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
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

// Search parameters schema (not stored in DB, just for validation)
export const tripSearchSchema = z.object({
  from: z.string().min(1, "From location is required"),
  to: z.string().min(1, "To location is required"),
  when: z.string().min(1, "Date is required"),
  ecoPriority: z.boolean().optional().default(false),
});

// Carbon calculation schema (not stored in DB, just for validation)
export const carbonCalcSchema = z.object({
  from: z.string().min(1, "From location is required"),
  to: z.string().min(1, "To location is required"),
  passengers: z.number().int().min(1).max(10),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  preferredTransportTypes: z.array(z.string()).optional(),
  preferredDestinations: z.array(z.string()).optional(),
  ecoMode: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

export type InsertTransportOption = z.infer<typeof insertTransportOptionSchema>;
export type TransportOption = typeof transportOptions.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export type InsertCarbonRecord = z.infer<typeof insertCarbonRecordSchema>;
export type CarbonRecord = typeof carbonRecords.$inferSelect;

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export type TripSearch = z.infer<typeof tripSearchSchema>;
export type CarbonCalc = z.infer<typeof carbonCalcSchema>;
