import { IStorage } from "./types";
import { User, Task, Note, InsertUser, InsertTask, InsertNote, studyPreferences, studyRecommendations, StudyPreferences, StudyRecommendation, InsertStudyPreferences, InsertStudyRecommendation } from "@shared/schema";
import { users, tasks, notes } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    if (!task) throw new Error("Task not found");
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values(insertNote).returning();
    return note;
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId));
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note> {
    const [note] = await db
      .update(notes)
      .set(updates)
      .where(eq(notes.id, id))
      .returning();
    if (!note) throw new Error("Note not found");
    return note;
  }

  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  // New methods for study preferences
  async getStudyPreferences(userId: number): Promise<StudyPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(studyPreferences)
      .where(eq(studyPreferences.userId, userId));
    return prefs;
  }

  async createOrUpdateStudyPreferences(userId: number, prefs: Partial<InsertStudyPreferences>): Promise<StudyPreferences> {
    const existingPrefs = await this.getStudyPreferences(userId);

    if (existingPrefs) {
      const [updated] = await db
        .update(studyPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(studyPreferences.id, existingPrefs.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(studyPreferences)
        .values({ ...prefs, userId })
        .returning();
      return created;
    }
  }

  // Methods for study recommendations
  async createRecommendation(userId: number, rec: Omit<InsertStudyRecommendation, "userId">): Promise<StudyRecommendation> {
    const [recommendation] = await db
      .insert(studyRecommendations)
      .values({ ...rec, userId })
      .returning();
    return recommendation;
  }

  async getUserRecommendations(userId: number): Promise<StudyRecommendation[]> {
    return await db
      .select()
      .from(studyRecommendations)
      .where(eq(studyRecommendations.userId, userId))
      .orderBy(studyRecommendations.createdAt);
  }
}

export const storage = new DatabaseStorage();