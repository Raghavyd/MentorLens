import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertStudentSchema, insertAlertSchema, insertInterventionSchema } from "@shared/schema";
import multer from "multer";
import { parse as parseCsv } from "csv-parse/sync";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup file upload middleware
  const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv') {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Student routes
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const { class: className, riskLevel, search } = req.query;
      const filters = {
        class: className as string,
        riskLevel: riskLevel as string,
        search: search as string,
      };
      const students = await storage.getStudents(filters);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/students/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStudentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  });

  app.get('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post('/api/students', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  app.put('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Alert routes
  app.get('/api/students/:id/alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAlertsByStudent(req.params.id);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/students/:id/alerts', isAuthenticated, async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse({
        ...req.body,
        studentId: req.params.id,
      });
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: "Failed to create alert" });
    }
  });

  // Intervention routes
  app.get('/api/students/:id/interventions', isAuthenticated, async (req, res) => {
    try {
      const interventions = await storage.getInterventionsByStudent(req.params.id);
      res.json(interventions);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  });

  app.post('/api/students/:id/interventions', isAuthenticated, async (req, res) => {
    try {
      const interventionData = insertInterventionSchema.parse({
        ...req.body,
        studentId: req.params.id,
      });
      const intervention = await storage.createIntervention(interventionData);
      res.status(201).json(intervention);
    } catch (error) {
      console.error("Error creating intervention:", error);
      res.status(400).json({ message: "Failed to create intervention" });
    }
  });

  // History routes for charts
  app.get('/api/students/:id/score-history', isAuthenticated, async (req, res) => {
    try {
      const history = await storage.getScoreHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching score history:", error);
      res.status(500).json({ message: "Failed to fetch score history" });
    }
  });

  app.get('/api/students/:id/attendance-history', isAuthenticated, async (req, res) => {
    try {
      const history = await storage.getAttendanceHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });

  // CSV Upload route
  app.post('/api/upload/csv', isAuthenticated, upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const records = parseCsv(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Process CSV records
      const studentsToCreate = records.map((record: any) => {
        // Determine risk level based on attendance and score
        const attendance = parseFloat(record.attendance || record.Attendance || '0');
        const scoreAverage = parseFloat(record.score_average || record['Score Average'] || record.score || '0');
        
        let riskLevel = 'low';
        if (attendance < 60 || scoreAverage < 60) {
          riskLevel = 'high';
        } else if (attendance < 75 || scoreAverage < 70) {
          riskLevel = 'medium';
        }

        return insertStudentSchema.parse({
          name: record.name || record.Name,
          class: record.class || record.Class,
          attendance: attendance.toString(),
          scoreAverage: scoreAverage.toString(),
          riskLevel,
          profileImageUrl: record.profile_image_url || record.profileImageUrl || null,
        });
      });

      // Create all students
      const createdStudents = [];
      for (const studentData of studentsToCreate) {
        const student = await storage.createStudent(studentData);
        createdStudents.push(student);
      }

      res.json({
        message: `Successfully imported ${createdStudents.length} students`,
        count: createdStudents.length,
        students: createdStudents,
      });
    } catch (error) {
      console.error("Error processing CSV upload:", error);
      res.status(400).json({ message: "Failed to process CSV file" });
    }
  });

  // CSV Preview route
  app.post('/api/upload/csv/preview', isAuthenticated, upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const records = parseCsv(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Return first 5 rows for preview
      const preview = records.slice(0, 5).map((record: any) => {
        const attendance = parseFloat(record.attendance || record.Attendance || '0');
        const scoreAverage = parseFloat(record.score_average || record['Score Average'] || record.score || '0');
        
        let riskLevel = 'low';
        if (attendance < 60 || scoreAverage < 60) {
          riskLevel = 'high';
        } else if (attendance < 75 || scoreAverage < 70) {
          riskLevel = 'medium';
        }

        return {
          name: record.name || record.Name,
          class: record.class || record.Class,
          attendance: attendance + '%',
          scoreAverage: scoreAverage,
          riskLevel,
        };
      });

      res.json({
        preview,
        totalRows: records.length,
      });
    } catch (error) {
      console.error("Error processing CSV preview:", error);
      res.status(400).json({ message: "Failed to process CSV file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
