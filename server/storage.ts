import { IStorage } from "./types";
import { User, Task, Note, InsertUser, InsertTask, InsertNote } from "@shared/schema";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private notes: Map<number, Note>;
  private currentId: { users: number; tasks: number; notes: number };

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notes = new Map();
    this.currentId = { users: 1, tasks: 1, notes: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId.tasks++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId.notes++;
    const note: Note = { ...insertNote, id };
    this.notes.set(id, note);
    return note;
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId || note.sharedWith.includes(userId.toString()),
    );
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note> {
    const note = this.notes.get(id);
    if (!note) throw new Error("Note not found");
    const updatedNote = { ...note, ...updates };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }
}

export const storage = new MemStorage();
