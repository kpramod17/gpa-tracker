import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTermSchema, insertCourseSchema, updateCourseSchema } from "@shared/schema";
import { setupAuthRoutes, isAuthenticated } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  await setupAuthRoutes(app);

  // Terms routes
  app.get("/api/terms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const terms = await storage.getTerms(userId);
      res.json(terms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  app.get("/api/terms/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const term = await storage.getTerm(req.params.id, userId);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch term" });
    }
  });

  app.post("/api/terms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const termData = insertTermSchema.parse({ ...req.body, userId });
      const term = await storage.createTerm(termData);
      res.status(201).json(term);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid term data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create term" });
    }
  });

  app.patch("/api/terms/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const term = await storage.updateTermStatus(req.params.id, status, userId);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Failed to update term status" });
    }
  });

  app.delete("/api/terms/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const deleted = await storage.deleteTerm(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete term" });
    }
  });

  // Courses routes
  app.get("/api/terms/:termId/courses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const courses = await storage.getCourses(req.params.termId, userId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const course = await storage.getCourse(req.params.id, userId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/terms/:termId/courses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const courseData = insertCourseSchema.parse({
        ...req.body,
        termId: req.params.termId
      });
      
      // Verify term belongs to user
      const term = await storage.getTerm(req.params.termId, userId);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const courseData = updateCourseSchema.parse(req.body);
      const course = await storage.updateCourse(req.params.id, courseData, userId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const deleted = await storage.deleteCourse(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // CSV Import/Export routes
  app.get("/api/csv/template", (req, res) => {
    const csvContent = `Term Name,Season,Year,Course Name,Units,Grade
Fall 2023,fall,2023,Calculus I,4,A
Fall 2023,fall,2023,English Composition,3,B+
Spring 2024,spring,2024,Physics I,4,A-
Spring 2024,spring,2024,Chemistry,3,B`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=gpa_tracker_template.csv');
    res.send(csvContent);
  });

  app.post("/api/csv/import", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { csvData } = req.body;
      
      if (!csvData || !Array.isArray(csvData)) {
        return res.status(400).json({ message: "Invalid CSV data format" });
      }

      // Process CSV data
      const termsMap = new Map();
      const courses: any[] = [];
      
      for (const row of csvData) {
        const [termName, season, year, courseName, units, grade] = row;
        
        if (!termName || !season || !year || !courseName || !units || !grade) {
          continue; // Skip incomplete rows
        }

        // Create term key
        const termKey = `${season}-${year}-${termName}`;
        
        if (!termsMap.has(termKey)) {
          termsMap.set(termKey, {
            userId,
            name: termName,
            season: season.toLowerCase(),
            year: parseInt(year),
            status: "completed"
          });
        }
        
        courses.push({
          termId: termKey, // We'll replace this with actual ID after term creation
          name: courseName,
          units: parseInt(units),
          grade: grade.toUpperCase()
        });
      }

      // Create terms first and get their IDs
      const termsList = Array.from(termsMap.values());
      const termIdMap = new Map();
      
      for (const termData of termsList) {
        const createdTerm = await storage.createTerm(termData);
        const termKey = `${termData.season}-${termData.year}-${termData.name}`;
        termIdMap.set(termKey, createdTerm.id);
      }
      
      // Update courses with actual term IDs
      for (const course of courses) {
        course.termId = termIdMap.get(course.termId);
        if (course.termId) {
          await storage.createCourse(course);
        }
      }
      
      res.json({ 
        message: "CSV data imported successfully",
        termsCreated: termsList.length,
        coursesCreated: courses.length 
      });
    } catch (error) {
      console.error("CSV import error:", error);
      res.status(500).json({ message: "Failed to import CSV data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}