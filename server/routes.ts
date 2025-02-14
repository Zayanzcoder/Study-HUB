import type { Express } from "express";
import { createServer } from "http";
import passport from 'passport';
import session from 'express-session';
import { storage } from "./storage";
import { insertTaskSchema, insertNoteSchema, insertStudyPreferencesSchema, User } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function registerRoutes(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/google',
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { 
      failureRedirect: '/',
      failureMessage: true
    }),
    (req, res) => {
      console.log('Google auth successful');
      res.redirect('/dashboard');
    }
  );

  app.get('/auth/status', (req, res) => {
    res.json({ 
      authenticated: req.isAuthenticated(),
      user: req.user 
    });
  });

  app.post('/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/api/user', (req, res) => {
    res.json(req.user || null);
  });

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

  // Temporarily disabled AI features
  app.post("/api/notes/generate", async (req, res) => {
    res.json({ 
      content: "Note generation is temporarily unavailable." 
    });
  });

  app.post("/api/notes/transcribe", async (req, res) => {
    res.json({ 
      text: "Voice transcription is temporarily unavailable." 
    });
  });

  app.get('/api/study-preferences', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const preferences = await storage.getStudyPreferences(req.user.id);
      res.json(preferences || null);
    } catch (error) {
      console.error('Error fetching study preferences:', error);
      res.status(500).json({ error: 'Failed to fetch study preferences' });
    }
  });

  app.post('/api/study-preferences', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const preferences = await storage.createOrUpdateStudyPreferences(req.user.id, req.body);
      res.json(preferences);
    } catch (error) {
      console.error('Error saving study preferences:', error);
      res.status(500).json({ error: 'Failed to save study preferences' });
    }
  });

  app.get('/api/recommendations', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const recommendations = await storage.getUserRecommendations(req.user.id);
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  app.post('/api/recommendations/generate', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const preferences = await storage.getStudyPreferences(req.user.id);
      if (!preferences) {
        return res.status(400).json({ error: 'Study preferences not set' });
      }

      const recommendation = await storage.createRecommendation(req.user.id, {
        subject: preferences.subjects?.[0] || 'General',
        recommendation: 'Based on your learning style and goals, we recommend focusing on interactive learning methods.',
        resources: 'Khan Academy, Coursera, and practice exercises',
        status: 'active'
      });

      res.json(recommendation);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      res.status(500).json({ error: 'Failed to generate recommendation' });
    }
  });

  // Temporarily disabled AI chat
  app.post("/api/ai/chat", async (req, res) => {
    res.json({ 
      response: "AI chat is temporarily unavailable." 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}