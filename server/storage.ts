import { IStorage } from "./types";
import { 
  User, Task, Note, InsertUser, InsertTask, InsertNote,
  studyPreferences, studyRecommendations, StudyPreferences, StudyRecommendation,
  InsertStudyPreferences, InsertStudyRecommendation,
  practiceTests, questions, studySchedules, studyBlocks, resources,
  achievements, userAchievements,
  PracticeTest, Question, StudySchedule, StudyBlock, Resource,
  Achievement, UserAchievement,
  insertPracticeTestSchema, insertQuestionSchema, insertStudyScheduleSchema,
  insertStudyBlockSchema, insertResourceSchema, insertAchievementSchema
} from "@shared/schema";
import { users, tasks, notes } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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

  // Practice Tests methods
  async createPracticeTest(test: typeof insertPracticeTestSchema._type): Promise<PracticeTest> {
    const [created] = await db.insert(practiceTests).values(test).returning();
    return created;
  }

  async getPracticeTests(): Promise<PracticeTest[]> {
    return await db.select().from(practiceTests);
  }

  async getPracticeTestById(id: number): Promise<PracticeTest | undefined> {
    const [test] = await db.select().from(practiceTests).where(eq(practiceTests.id, id));
    return test;
  }

  async addQuestionToPracticeTest(question: typeof insertQuestionSchema._type): Promise<Question> {
    const [created] = await db.insert(questions).values(question).returning();
    return created;
  }

  async getQuestionsForTest(testId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.testId, testId));
  }

  // Study Schedule methods
  async createStudySchedule(schedule: typeof insertStudyScheduleSchema._type): Promise<StudySchedule> {
    const [created] = await db.insert(studySchedules).values(schedule).returning();
    return created;
  }

  async getUserStudySchedules(userId: string): Promise<StudySchedule[]> {
    return await db.select()
      .from(studySchedules)
      .where(eq(studySchedules.userId, userId))
      .orderBy(studySchedules.startDate);
  }

  async addStudyBlock(block: typeof insertStudyBlockSchema._type): Promise<StudyBlock> {
    const [created] = await db.insert(studyBlocks).values(block).returning();
    return created;
  }

  async getStudyBlocksForSchedule(scheduleId: number): Promise<StudyBlock[]> {
    return await db.select()
      .from(studyBlocks)
      .where(eq(studyBlocks.scheduleId, scheduleId))
      .orderBy(studyBlocks.startTime);
  }

  async updateStudyBlock(id: number, updates: Partial<StudyBlock>): Promise<StudyBlock> {
    const [updated] = await db
      .update(studyBlocks)
      .set(updates)
      .where(eq(studyBlocks.id, id))
      .returning();
    if (!updated) throw new Error("Study block not found");
    return updated;
  }

  // Resource Library methods
  async createResource(resource: typeof insertResourceSchema._type): Promise<Resource> {
    const [created] = await db.insert(resources).values(resource).returning();
    return created;
  }

  async getResources(subject?: string, grade?: number): Promise<Resource[]> {
    let query = db.select().from(resources);
    if (subject) {
      query = query.where(eq(resources.subject, subject));
    }
    if (grade) {
      query = query.where(eq(resources.grade, grade));
    }
    return await query;
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  // Gamification methods
  async createAchievement(achievement: typeof insertAchievementSchema._type): Promise<Achievement> {
    const [created] = await db.insert(achievements).values(achievement).returning();
    return created;
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async awardAchievementToUser(userId: string, achievementId: number): Promise<UserAchievement> {
    const [awarded] = await db.insert(userAchievements)
      .values({ userId, achievementId })
      .returning();
    return awarded;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db.select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        totalPoints: points
      })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async updateUserStreak(userId: string, streak: number): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        currentStreak: streak
      })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async getUserTasks(userId: string): Promise<Task[]> {
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

  async getUserNotes(userId: string): Promise<Note[]> {
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

  async getStudyPreferences(userId: string): Promise<StudyPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(studyPreferences)
      .where(eq(studyPreferences.userId, userId));
    return prefs;
  }

  async createOrUpdateStudyPreferences(userId: string, prefs: Partial<InsertStudyPreferences>): Promise<StudyPreferences> {
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

  async createRecommendation(userId: string, rec: Omit<InsertStudyRecommendation, "userId">): Promise<StudyRecommendation> {
    const [recommendation] = await db
      .insert(studyRecommendations)
      .values({ ...rec, userId })
      .returning();
    return recommendation;
  }

  async getUserRecommendations(userId: string): Promise<StudyRecommendation[]> {
    return await db
      .select()
      .from(studyRecommendations)
      .where(eq(studyRecommendations.userId, userId))
      .orderBy(studyRecommendations.createdAt);
  }

  async deleteRecommendation(id: number): Promise<void> {
    await db.delete(studyRecommendations).where(eq(studyRecommendations.id, id));
  }
}

export const storage = new DatabaseStorage();