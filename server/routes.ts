import type { Express, Request } from "express";
import { createServer } from "http";
import passport from 'passport';
import session from 'express-session';
import { storage } from "./storage";
import { insertTaskSchema, insertNoteSchema, insertStudyPreferencesSchema, User, insertPracticeTestSchema, insertQuestionSchema, insertStudyScheduleSchema, insertStudyBlockSchema, insertResourceSchema } from "@shared/schema";
import { z } from "zod";
import { generateStudyRecommendation, generateStudyNotes } from './services/ai';
import { type AuthUser } from './auth';
import OpenAI from "openai";

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeChatMessage(message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI tutor specializing in CBSE/NCERT curriculum. Help students understand concepts, solve problems, and provide study guidance. Keep responses focused on academic content and learning. Try to give examples from NCERT textbooks when possible."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.6
    });

    return response.choices[0].message.content || "I apologize, I couldn't process that request.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to process message: " + error.message);
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

  // Enable AI chat with welcome message
  app.post("/api/ai/chat", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // If this is the first message, return the welcome message
    if (!req.body.message) {
      return res.json({ 
        response: `Hi there! I'm Zoha, your personal study companion at Study Hub! 👋

        I'm here to help you excel in your CBSE/NCERT studies. Whether you need help understanding concepts, creating study plans, or preparing for exams, I'm here to support you.

        What would you like help with today? You can:
        - Ask questions about your NCERT subjects
        - Get help with specific topics or concepts
        - Request study tips and strategies
        - Get guidance on exam preparation

        Feel free to ask me anything!`
      });
    }

    // Handle regular chat messages using OpenAI
    try {
      const message = req.body.message;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          error: 'Invalid message',
          message: 'Please provide a valid message.'
        });
      }

      const response = await analyzeChatMessage(message);
      res.json({ response });
    } catch (error: any) {
      console.error('AI Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat message',
        message: error.message || 'Our AI service is experiencing issues. Please try again later.'
      });
    }
  });


  // Auth routes
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
    (req:Request, res) => {
      console.log('Google auth successful');
      res.redirect('/dashboard');
    }
  );

  // Auth status routes
  app.get('/auth/status', (req: Request, res) => {
    res.json({ 
      authenticated: req.isAuthenticated(),
      user: req.user 
    });
  });

  // Update all routes to use proper typing
  app.get('/api/user', (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
  });

  app.post("/api/tasks", async (req: Request, res) => {
    try {
      const task = insertTaskSchema.parse(req.body);
      // Ensure task.userId is a string
      const created = await storage.createTask({
        ...task,
        userId: String(task.userId)
      });
      res.json(created);
    } catch (error: any) {
      console.error("Task creation error:", error);
      res.status(400).json({ error: "Invalid task data", details: error.message });
    }
  });

  app.get("/api/tasks/:userId", async (req: Request, res) => {
    try {
      const userId = req.params.userId;
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks", details: error.message });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updated = await storage.updateTask(id, updates);
      res.json(updated);
    } catch (error: any) {
      console.error("Task update error:", error);
      res.status(404).json({ error: "Task not found", details: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.post("/api/notes", async (req: Request, res) => {
    try {
      const note = insertNoteSchema.parse(req.body);
      const created = await storage.createNote(note);
      res.json(created);
    } catch (error) {
      console.error("Note creation error:", error);
      res.status(400).json({ error: "Invalid note data", details: error.message });
    }
  });

  app.get("/api/notes/:userId", async (req: Request, res) => {
    const userId = parseInt(req.params.userId);
    const notes = await storage.getUserNotes(userId);
    res.json(notes);
  });

  app.patch("/api/notes/:id", async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updated = await storage.updateNote(id, updates);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  app.delete("/api/notes/:id", async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNote(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  app.post("/api/notes/generate", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      // Get user's study preferences for context
      const preferences = await storage.getStudyPreferences(req.user.id);

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ 
          error: 'AI Service Unavailable', 
          message: 'The AI note generation service is temporarily unavailable. Please try again later.'
        });
      }

      // Generate note content using Gemini
      try {
        const noteContent = await generateStudyNotes(topic, {
          learningStyle: preferences?.learningStyle || 'visual',
          difficultyLevel: preferences?.difficultyLevel || 'intermediate'
        });

        res.json({ content: noteContent });
      } catch (aiError: any) {
        console.error('AI Service error:', aiError);
        return res.status(503).json({ 
          error: 'AI Service Error', 
          message: 'Failed to generate notes. Our AI service is experiencing issues. Please try again later.'
        });
      }
    } catch (error: any) {
      console.error('Note generation error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while generating notes.'
      });
    }
  });

  app.post("/api/notes/transcribe", async (req: Request, res) => {
    res.json({ 
      text: "Voice transcription is temporarily unavailable." 
    });
  });

  app.get('/api/study-preferences', async (req: Request, res) => {
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

  app.post('/api/study-preferences', async (req: Request, res) => {
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

  app.get('/api/recommendations', async (req: Request, res) => {
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

  app.post('/api/recommendations/generate', async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const preferences = await storage.getStudyPreferences(req.user.id);
      if (!preferences) {
        return res.status(400).json({ error: 'Study preferences not set' });
      }

      // Generate personalized recommendation using Gemini
      const { recommendation, resources } = await generateStudyRecommendation({
        subjects: preferences.subjects || [],
        learningStyle: preferences.learningStyle || 'visual',
        studyGoals: preferences.studyGoals || '',
        difficultyLevel: preferences.difficultyLevel || 'intermediate'
      });

      // Create and store the recommendation
      const newRecommendation = await storage.createRecommendation(req.user.id, {
        subject: preferences.subjects?.[0] || 'General',
        recommendation,
        resources,
        status: 'active'
      });

      res.json(newRecommendation);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      res.status(500).json({ error: 'Failed to generate recommendation' });
    }
  });

  app.delete('/api/recommendations/:id', async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRecommendation(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      res.status(500).json({ error: 'Failed to delete recommendation' });
    }
  });


  app.post("/api/practice-tests", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const test = insertPracticeTestSchema.parse(req.body);
      const created = await storage.createPracticeTest(test);
      res.json(created);
    } catch (error: any) {
      console.error("Practice test creation error:", error);
      res.status(400).json({ error: "Invalid test data", details: error.message });
    }
  });

  app.get("/api/practice-tests", async (req: Request, res) => {
    try {
      const tests = await storage.getPracticeTests();
      res.json(tests);
    } catch (error: any) {
      console.error("Error fetching practice tests:", error);
      res.status(500).json({ error: "Failed to fetch practice tests" });
    }
  });

  app.get("/api/practice-tests/:id", async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.getPracticeTestById(id);
      if (!test) {
        return res.status(404).json({ error: "Practice test not found" });
      }
      const questions = await storage.getQuestionsForTest(id);
      res.json({ ...test, questions });
    } catch (error: any) {
      console.error("Error fetching practice test:", error);
      res.status(500).json({ error: "Failed to fetch practice test" });
    }
  });

  app.post("/api/practice-tests/:id/questions", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const testId = parseInt(req.params.id);
      const question = insertQuestionSchema.parse({ ...req.body, testId });
      const created = await storage.addQuestionToPracticeTest(question);
      res.json(created);
    } catch (error: any) {
      console.error("Question creation error:", error);
      res.status(400).json({ error: "Invalid question data", details: error.message });
    }
  });

  // Study Schedule routes
  app.post("/api/study-schedules", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const schedule = insertStudyScheduleSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const created = await storage.createStudySchedule(schedule);
      res.json(created);
    } catch (error: any) {
      console.error("Schedule creation error:", error);
      res.status(400).json({ error: "Invalid schedule data", details: error.message });
    }
  });

  app.get("/api/study-schedules", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const schedules = await storage.getUserStudySchedules(req.user.id);
      res.json(schedules);
    } catch (error: any) {
      console.error("Error fetching study schedules:", error);
      res.status(500).json({ error: "Failed to fetch study schedules" });
    }
  });

  app.post("/api/study-blocks", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const block = insertStudyBlockSchema.parse(req.body);
      const created = await storage.addStudyBlock(block);
      res.json(created);
    } catch (error: any) {
      console.error("Study block creation error:", error);
      res.status(400).json({ error: "Invalid block data", details: error.message });
    }
  });

  app.patch("/api/study-blocks/:id", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateStudyBlock(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Study block update error:", error);
      res.status(400).json({ error: "Failed to update study block" });
    }
  });

  // Resource Library routes
  app.post("/api/resources", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const resource = insertResourceSchema.parse({
        ...req.body,
        uploadedBy: req.user.id
      });
      const created = await storage.createResource(resource);
      res.json(created);
    } catch (error: any) {
      console.error("Resource creation error:", error);
      res.status(400).json({ error: "Invalid resource data", details: error.message });
    }
  });

  app.get("/api/resources", async (req: Request, res) => {
    try {
      const { subject, grade } = req.query;
      const resources = await storage.getResources(
        subject as string | undefined,
        grade ? parseInt(grade as string) : undefined
      );
      res.json(resources);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  // Gamification routes
  app.get("/api/achievements", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(req.user.id);
      res.json({
        available: achievements,
        earned: userAchievements
      });
    } catch (error: any) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements/:id/award", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const achievementId = parseInt(req.params.id);
      const awarded = await storage.awardAchievementToUser(req.user.id, achievementId);
      res.json(awarded);
    } catch (error: any) {
      console.error("Error awarding achievement:", error);
      res.status(500).json({ error: "Failed to award achievement" });
    }
  });

  app.patch("/api/users/points", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const { points } = req.body;
      const updated = await storage.updateUserPoints(req.user.id, points);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating points:", error);
      res.status(500).json({ error: "Failed to update points" });
    }
  });

  app.patch("/api/users/streak", async (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const { streak } = req.body;
      const updated = await storage.updateUserStreak(req.user.id, streak);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating streak:", error);
      res.status(500).json({ error: "Failed to update streak" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}