import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
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
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
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
});

export const insertTransportOptionSchema = createInsertSchema(transportOptions).omit({
  id: true,
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

export type InsertTransportOption = z.infer<typeof insertTransportOptionSchema>;
export type TransportOption = typeof transportOptions.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export type TripSearch = z.infer<typeof tripSearchSchema>;
export type CarbonCalc = z.infer<typeof carbonCalcSchema>;
