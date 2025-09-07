import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertAlertSchema, insertInterventionSchema } from "@shared/schema";
import multer from "multer";
import { parse as parseCsv } from "csv-parse/sync";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup file upload middleware
  const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype === 'text/csv') {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  // Student routes
  app.get('/api/students', async (req, res) => {
    try {
      const { class: className, riskLevel, search } = req.query;
      const filters: any = {};
      
      if (className && typeof className === 'string') filters.class = className;
      if (riskLevel && typeof riskLevel === 'string') filters.riskLevel = riskLevel;
      if (search && typeof search === 'string') filters.search = search;

      const students = await storage.getStudents(filters);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/students/stats', async (req, res) => {
    try {
      const stats = await storage.getStudentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  });

  app.get('/api/students/:id', async (req, res) => {
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

  app.post('/api/students', async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    try {
      const studentData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, studentData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Alert routes
  app.get('/api/students/:id/alerts', async (req, res) => {
    try {
      const alerts = await storage.getAlertsByStudent(req.params.id);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/students/:id/alerts', async (req, res) => {
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
  app.get('/api/students/:id/interventions', async (req, res) => {
    try {
      const interventions = await storage.getInterventionsByStudent(req.params.id);
      res.json(interventions);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  });

  app.post('/api/students/:id/interventions', async (req, res) => {
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

  // History routes
  app.get('/api/students/:id/score-history', async (req, res) => {
    try {
      const scoreHistory = await storage.getScoreHistory(req.params.id);
      res.json(scoreHistory);
    } catch (error) {
      console.error("Error fetching score history:", error);
      res.status(500).json({ message: "Failed to fetch score history" });
    }
  });

  app.get('/api/students/:id/attendance-history', async (req, res) => {
    try {
      const attendanceHistory = await storage.getAttendanceHistory(req.params.id);
      res.json(attendanceHistory);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });

  // CSV upload routes
  app.post('/api/upload/csv', upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file provided" });
      }

      const csvData = req.file.buffer.toString();
      const records = parseCsv(csvData, {
        columns: true,
        skip_empty_lines: true,
      });

      const students = [];
      for (const record of records) {
        try {
          const studentData = insertStudentSchema.parse({
            name: record.name || record.Name,
            email: record.email || record.Email,
            class: record.class || record.Class,
            attendanceRate: parseFloat(record.attendanceRate || record['Attendance Rate'] || '0'),
            scoreAverage: parseFloat(record.scoreAverage || record['Score Average'] || '0'),
            riskLevel: record.riskLevel || record['Risk Level'] || 'low',
          });

          const student = await storage.createStudent(studentData);
          students.push(student);
        } catch (error) {
          console.error("Error creating student from CSV:", error);
        }
      }

      res.json({ 
        message: `Successfully imported ${students.length} students`,
        students 
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(400).json({ message: "Failed to process CSV file" });
    }
  });

  app.post('/api/upload/csv/preview', upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file provided" });
      }

      const csvData = req.file.buffer.toString();
      const records = parseCsv(csvData, {
        columns: true,
        skip_empty_lines: true,
      });

      // Return first 5 records as preview
      const preview = records.slice(0, 5).map((record: any) => ({
        name: record.name || record.Name || '',
        email: record.email || record.Email || '',
        class: record.class || record.Class || '',
        attendanceRate: record.attendanceRate || record['Attendance Rate'] || '',
        scoreAverage: record.scoreAverage || record['Score Average'] || '',
        riskLevel: record.riskLevel || record['Risk Level'] || '',
      }));

      res.json({ 
        totalRows: records.length,
        preview,
        columns: Object.keys(records[0] || {})
      });
    } catch (error) {
      console.error("CSV preview error:", error);
      res.status(400).json({ message: "Failed to preview CSV file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}