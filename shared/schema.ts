import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("pending"),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  sharedWith: text("shared_with").array(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  avatar: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  status: true,
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  title: true,
  content: true,
  isPublic: true,
  sharedWith: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Note = typeof notes.$inferSelect;
