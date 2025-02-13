import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { getAIResponse } from "./ai";
import { insertTaskSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express) {
  app.post("/api/tasks", async (req, res) => {
    try {
      const task = insertTaskSchema.parse(req.body);
      const created = await storage.createTask(task);
      res.json(created);
    } catch (error) {
      console.error("Task creation error:", error);
      res.status(400).json({ error: "Invalid task data", details: error.message });
    }
  });

  app.get("/api/tasks/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const tasks = await storage.getUserTasks(userId);
    res.json(tasks);
  });

  app.patch("/api/tasks/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateTask(id, { status: "completed" });
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const note = insertNoteSchema.parse(req.body);
      const created = await storage.createNote(note);
      res.json(created);
    } catch (error) {
      console.error("Note creation error:", error);
      res.status(400).json({ error: "Invalid note data", details: error.message });
    }
  });

  app.get("/api/notes/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const notes = await storage.getUserNotes(userId);
    res.json(notes);
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updated = await storage.updateNote(id, updates);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNote(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt } = z.object({ prompt: z.string() }).parse(req.body);
      const response = await getAIResponse(prompt);
      res.json({ response });
    } catch (error: any) {
      console.error("AI chat error:", error);
      if (error.status === 429) {
        res.status(503).json({ 
          error: "AI service is currently unavailable", 
          message: error.message 
        });
      } else {
        res.status(400).json({ 
          error: "Failed to process request",
          message: error.message || "An unexpected error occurred"
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}