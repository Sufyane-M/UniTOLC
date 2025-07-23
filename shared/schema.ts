import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enumerazioni
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const examTypeEnum = pgEnum('exam_type', ['TOLC-I', 'TOLC-E', 'TOLC-F', 'TOLC-S', 'ENGLISH-TOLC']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'expired', 'trial']);
export const quizTypeEnum = pgEnum('quiz_type', ['simulation', 'topic', 'flashcard', 'daily_challenge']);
export const subjectEnum = pgEnum('subject', [
  'matematica', 'fisica', 'chimica', 'logica', 
  'comprensione_verbale', 'scienze', 'economia', 'inglese'
]);
export const difficultyEnum = pgEnum('difficulty', ['facile', 'media', 'difficile']);

// Tabella users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").default("user").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  xpPoints: integer("xp_points").default(0),
  lastActive: timestamp("last_active").defaultNow(),
  profileImage: text("profile_image"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella user_exams
export const userExams = pgTable("user_exams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  examType: examTypeEnum("exam_type").notNull(),
  university: text("university"),
  examDate: date("exam_date"),
  targetScore: integer("target_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  paymentMethod: text("payment_method"),
  amount: integer("amount"), // in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella delle materie/argomenti
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  examType: examTypeEnum("exam_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella topics (sotto-argomenti)
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella tolc_exam_types
export const tolcExamTypes = pgTable("tolc_exam_types", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  totalDuration: integer("total_duration").notNull(),
  totalSections: integer("total_sections").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Tabella tolc_exam_sections
export const tolcExamSections = pgTable("tolc_exam_sections", {
  id: serial("id").primaryKey(),
  examTypeId: integer("exam_type_id").notNull().references(() => tolcExamTypes.id, { onDelete: 'cascade' }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  timeLimit: integer("time_limit").notNull(),
  questionCount: integer("question_count").notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Tabella questions_unified (unifies questions and tolc_questions)
export const questions = pgTable("questions_unified", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id, { onDelete: 'cascade' }),
  sectionId: integer("section_id").references(() => tolcExamSections.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty"),
  isPremium: boolean("is_premium").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  imageUrl: text("image_url"),
  imageAltText: text("image_alt_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Tabella quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: quizTypeEnum("type").notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  questions: jsonb("questions"), // array di ID domande o domande dirette
  timeLimit: integer("time_limit"), // in secondi
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella user_quiz_attempts
export const userQuizAttempts = pgTable("user_quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers"),
  timeSpent: integer("time_spent"), // in secondi
  answers: jsonb("answers"), // risposte dell'utente
  completed: boolean("completed").default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Tabella study_sessions
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subjectId: integer("subject_id").references(() => subjects.id),
  topicId: integer("topic_id").references(() => topics.id),
  duration: integer("duration").notNull(), // in secondi
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella weak_areas
export const weakAreas = pgTable("weak_areas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: 'cascade' }),
  accuracy: integer("accuracy").notNull(), // percentuale
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});



// Tabella learning_resources
export const learningResources = pgTable("learning_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // pdf, video, link, etc
  url: text("url"),
  content: text("content"),
  topicId: integer("topic_id").references(() => topics.id, { onDelete: 'set null' }),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema di validazione per inserimento utente
export const insertUserSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  username: z.string().min(3, "Lo username deve avere almeno 3 caratteri"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  fullName: z.string().min(1, "Il nome completo è richiesto"),
});

// Schema di validazione per login
export const loginUserSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "Inserisci la password"),
});

// Schema di validazione per registrazione esame
export const insertUserExamSchema = z.object({
  examType: z.enum(["tolc-i", "tolc-e", "tolc-f", "tolc-s", "tolc-su", "tolc-av", "tolc-b", "tolc-cla", "tolc-dsu", "tolc-ps"]),
  university: z.string().optional(),
  examDate: z.string().optional(),
  targetScore: z.number().optional(),
});

// Schema di validazione per creazione quiz
export const insertQuizSchema = z.object({
  title: z.string().min(1, "Il titolo è richiesto"),
  description: z.string().optional(),
  type: z.enum(["practice", "mock", "custom"]),
  subjectId: z.number().optional(),
  timeLimit: z.number().optional(),
  isPremium: z.boolean().optional(),
  questions: z.array(z.number()),
});

// Definizione dei tipi
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type UserExam = typeof userExams.$inferSelect;
export type InsertUserExam = z.infer<typeof insertUserExamSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type WeakArea = typeof weakAreas.$inferSelect;

export type LearningResource = typeof learningResources.$inferSelect;
