import {
  students,
  alerts,
  interventions,
  scoreHistory,
  attendanceHistory,
  type Student,
  type InsertStudent,
  type Alert,
  type InsertAlert,
  type Intervention,
  type InsertIntervention,
  type ScoreHistory,
  type InsertScoreHistory,
  type AttendanceHistory,
  type InsertAttendanceHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // Student operations
  getStudents(filters?: { class?: string; riskLevel?: string; search?: string }): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  getStudentStats(): Promise<{ lowRisk: number; mediumRisk: number; highRisk: number; total: number }>;

  // Alert operations
  getAlertsByStudent(studentId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;

  // Intervention operations
  getInterventionsByStudent(studentId: string): Promise<Intervention[]>;
  createIntervention(intervention: InsertIntervention): Promise<Intervention>;

  // History operations for charts
  getScoreHistory(studentId: string): Promise<ScoreHistory[]>;
  getAttendanceHistory(studentId: string): Promise<AttendanceHistory[]>;
  addScoreHistory(scoreHistory: InsertScoreHistory): Promise<ScoreHistory>;
  addAttendanceHistory(attendanceHistory: InsertAttendanceHistory): Promise<AttendanceHistory>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Student operations
  async getStudents(filters?: { class?: string; riskLevel?: string; search?: string }): Promise<Student[]> {
    let query = db.select().from(students);
    
    const conditions = [];
    if (filters?.class) {
      conditions.push(eq(students.class, filters.class));
    }
    if (filters?.riskLevel) {
      conditions.push(eq(students.riskLevel, filters.riskLevel));
    }
    if (filters?.search) {
      conditions.push(sql`${students.name} ILIKE ${`%${filters.search}%`}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(students.name);
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getStudentStats(): Promise<{ lowRisk: number; mediumRisk: number; highRisk: number; total: number }> {
    const [lowRisk] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.riskLevel, 'low'));
    
    const [mediumRisk] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.riskLevel, 'medium'));
    
    const [highRisk] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.riskLevel, 'high'));
    
    const [total] = await db
      .select({ count: count() })
      .from(students);

    return {
      lowRisk: lowRisk.count,
      mediumRisk: mediumRisk.count,
      highRisk: highRisk.count,
      total: total.count,
    };
  }

  // Alert operations
  async getAlertsByStudent(studentId: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.studentId, studentId))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  // Intervention operations
  async getInterventionsByStudent(studentId: string): Promise<Intervention[]> {
    return await db
      .select()
      .from(interventions)
      .where(eq(interventions.studentId, studentId))
      .orderBy(desc(interventions.createdAt));
  }

  async createIntervention(intervention: InsertIntervention): Promise<Intervention> {
    const [newIntervention] = await db
      .insert(interventions)
      .values(intervention)
      .returning();
    return newIntervention;
  }

  // History operations
  async getScoreHistory(studentId: string): Promise<ScoreHistory[]> {
    return await db
      .select()
      .from(scoreHistory)
      .where(eq(scoreHistory.studentId, studentId))
      .orderBy(scoreHistory.createdAt);
  }

  async getAttendanceHistory(studentId: string): Promise<AttendanceHistory[]> {
    return await db
      .select()
      .from(attendanceHistory)
      .where(eq(attendanceHistory.studentId, studentId))
      .orderBy(attendanceHistory.createdAt);
  }

  async addScoreHistory(scoreHistoryData: InsertScoreHistory): Promise<ScoreHistory> {
    const [newScoreHistory] = await db
      .insert(scoreHistory)
      .values(scoreHistoryData)
      .returning();
    return newScoreHistory;
  }

  async addAttendanceHistory(attendanceHistoryData: InsertAttendanceHistory): Promise<AttendanceHistory> {
    const [newAttendanceHistory] = await db
      .insert(attendanceHistory)
      .values(attendanceHistoryData)
      .returning();
    return newAttendanceHistory;
  }
}

export const storage = new DatabaseStorage();
