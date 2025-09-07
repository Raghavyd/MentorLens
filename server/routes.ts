import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { requireAuth, hashPassword, verifyPassword } from "./auth";
import { insertStudentSchema, insertAlertSchema, insertInterventionSchema, insertUserSchema, loginUserSchema } from "@shared/schema";
import multer from "multer";
import { parse as parseCsv } from "csv-parse/sync";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  }));

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

  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Set session
      (req.session as any).userId = user.id;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Failed to login" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Student routes
  app.get('/api/students', requireAuth, async (req: any, res) => {
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

  app.get('/api/students/stats', requireAuth, async (req: any, res) => {
    try {
      const stats = await storage.getStudentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  });

  app.get('/api/students/:id', requireAuth, async (req: any, res) => {
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

  app.post('/api/students', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  app.put('/api/students/:id', requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/students/:id', requireAuth, async (req: any, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Alert routes
  app.get('/api/students/:id/alerts', requireAuth, async (req: any, res) => {
    try {
      const alerts = await storage.getAlertsByStudent(req.params.id);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/students/:id/alerts', requireAuth, async (req: any, res) => {
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
  app.get('/api/students/:id/interventions', requireAuth, async (req: any, res) => {
    try {
      const interventions = await storage.getInterventionsByStudent(req.params.id);
      res.json(interventions);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  });

  app.post('/api/students/:id/interventions', requireAuth, async (req: any, res) => {
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
  app.get('/api/students/:id/score-history', requireAuth, async (req: any, res) => {
    try {
      const history = await storage.getScoreHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching score history:", error);
      res.status(500).json({ message: "Failed to fetch score history" });
    }
  });

  app.get('/api/students/:id/attendance-history', requireAuth, async (req: any, res) => {
    try {
      const history = await storage.getAttendanceHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });

  // CSV Upload route
  app.post('/api/upload/csv', requireAuth, upload.single('csvFile'), async (req: any, res) => {
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
  app.post('/api/upload/csv/preview', requireAuth, upload.single('csvFile'), async (req: any, res) => {
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
