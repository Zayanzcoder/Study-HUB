import { pgTable, text, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing tables
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("pending"),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  sharedWith: text("shared_with").array(),
});

// Update study preferences table
export const studyPreferences = pgTable("study_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  subjects: text("subjects").array(),
  learningStyle: text("learning_style"),
  studyGoals: text("study_goals"),
  difficultyLevel: text("difficulty_level"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Update study recommendations table
export const studyRecommendations = pgTable("study_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  subject: text("subject").notNull(),
  recommendation: text("recommendation").notNull(),
  resources: text("resources"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
});

// Keep existing schemas
export const insertUserSchema = createInsertSchema(users, {
  avatar: z.string().nullable(),
});

export const insertTaskSchema = createInsertSchema(tasks, {
  dueDate: z.string().nullable().transform((str) => str ? new Date(str) : null),
  description: z.string().nullable(),
  status: z.string().default("pending"),
});

export const insertNoteSchema = createInsertSchema(notes, {
  sharedWith: z.array(z.string()).nullable(),
});

// Add new schemas for study preferences and recommendations
export const insertStudyPreferencesSchema = createInsertSchema(studyPreferences, {
  subjects: z.array(z.string()),
  learningStyle: z.string(),
  studyGoals: z.string(),
  difficultyLevel: z.string(),
});

export const insertStudyRecommendationSchema = createInsertSchema(studyRecommendations, {
  resources: z.string().nullable(),
});

// Keep existing types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;

// Add new types
export type InsertStudyPreferences = z.infer<typeof insertStudyPreferencesSchema>;
export type InsertStudyRecommendation = z.infer<typeof insertStudyRecommendationSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type StudyPreferences = typeof studyPreferences.$inferSelect;
export type StudyRecommendation = typeof studyRecommendations.$inferSelect;