import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  class: varchar("class").notNull(),
  attendance: decimal("attendance", { precision: 5, scale: 2 }).notNull(),
  scoreAverage: decimal("score_average", { precision: 5, scale: 2 }).notNull(),
  riskLevel: varchar("risk_level").notNull(), // 'low', 'medium', 'high'
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default('active'), // 'active', 'resolved'
  createdAt: timestamp("created_at").defaultNow(),
});

// Interventions table
export const interventions = pgTable("interventions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  note: text("note").notNull(),
  outcome: varchar("outcome").notNull().default('in_progress'), // 'in_progress', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

// Score history for trend charts
export const scoreHistory = pgTable("score_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  subject: varchar("subject"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance history for trend charts
export const attendanceHistory = pgTable("attendance_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  attendanceRate: decimal("attendance_rate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  alerts: many(alerts),
  interventions: many(interventions),
  scoreHistory: many(scoreHistory),
  attendanceHistory: many(attendanceHistory),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  student: one(students, {
    fields: [alerts.studentId],
    references: [students.id],
  }),
}));

export const interventionsRelations = relations(interventions, ({ one }) => ({
  student: one(students, {
    fields: [interventions.studentId],
    references: [students.id],
  }),
}));

export const scoreHistoryRelations = relations(scoreHistory, ({ one }) => ({
  student: one(students, {
    fields: [scoreHistory.studentId],
    references: [students.id],
  }),
}));

export const attendanceHistoryRelations = relations(attendanceHistory, ({ one }) => ({
  student: one(students, {
    fields: [attendanceHistory.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertInterventionSchema = createInsertSchema(interventions).omit({
  id: true,
  createdAt: true,
});

export const insertScoreHistorySchema = createInsertSchema(scoreHistory).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceHistorySchema = createInsertSchema(attendanceHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Intervention = typeof interventions.$inferSelect;
export type InsertIntervention = z.infer<typeof insertInterventionSchema>;
export type ScoreHistory = typeof scoreHistory.$inferSelect;
export type InsertScoreHistory = z.infer<typeof insertScoreHistorySchema>;
export type AttendanceHistory = typeof attendanceHistory.$inferSelect;
export type InsertAttendanceHistory = z.infer<typeof insertAttendanceHistorySchema>;
