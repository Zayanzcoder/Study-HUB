import { pgTable, text, serial, varchar, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
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
  currentStreak: integer("current_streak").default(0),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
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

// Practice Tests
export const practiceTests = pgTable("practice_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  grade: integer("grade").notNull(),
  description: text("description"),
  difficultyLevel: text("difficulty_level").notNull(),
  timeLimit: integer("time_limit"), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // Array of options
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  marks: integer("marks").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
});

// Study Schedules
export const studySchedules = pgTable("study_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  recurringDays: jsonb("recurring_days"), // Array of weekdays
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studyBlocks = pgTable("study_blocks", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull(),
  subject: text("subject").notNull(),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").default("pending"),
  priority: text("priority").default("medium"),
});

// Learning Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // textbook, paper, video, etc.
  subject: text("subject").notNull(),
  grade: integer("grade").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Gamification
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // streak, completion, mastery
  requirements: jsonb("requirements").notNull(),
  points: integer("points").notNull(),
  icon: text("icon").notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  achievementId: integer("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
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

// Add insert schemas for new tables
export const insertPracticeTestSchema = createInsertSchema(practiceTests);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertStudyScheduleSchema = createInsertSchema(studySchedules);
export const insertStudyBlockSchema = createInsertSchema(studyBlocks);
export const insertResourceSchema = createInsertSchema(resources);
export const insertAchievementSchema = createInsertSchema(achievements);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);

// Keep existing types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type InsertStudyPreferences = z.infer<typeof insertStudyPreferencesSchema>;
export type InsertStudyRecommendation = z.infer<typeof insertStudyRecommendationSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type StudyPreferences = typeof studyPreferences.$inferSelect;
export type StudyRecommendation = typeof studyRecommendations.$inferSelect;

// Add types for new tables
export type PracticeTest = typeof practiceTests.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type StudySchedule = typeof studySchedules.$inferSelect;
export type StudyBlock = typeof studyBlocks.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;