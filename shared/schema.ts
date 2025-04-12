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
  studyStreak: integer("study_streak").default(0),
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

// Tabella questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  options: jsonb("options").notNull(), // array di opzioni
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: difficultyEnum("difficulty").default("media").notNull(),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Tabella study_recommendations
export const studyRecommendations = pgTable("study_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: 'cascade' }),
  priority: text("priority").notNull(), // alta, media, bassa
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella daily_challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // quiz, flashcard, studio, etc
  targetId: integer("target_id"), // ID del quiz o altra risorsa
  xpReward: integer("xp_reward").notNull(),
  date: date("date").notNull(),
  difficulty: difficultyEnum("difficulty").default("media").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella user_challenge_completions
export const userChallengeCompletions = pgTable("user_challenge_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: integer("challenge_id").notNull().references(() => dailyChallenges.id, { onDelete: 'cascade' }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
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
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  fullName: true,
}).extend({
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  email: z.string().email("Inserisci un'email valida"),
  username: z.string().min(3, "Lo username deve avere almeno 3 caratteri"),
});

// Schema di validazione per login
export const loginUserSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "Inserisci la password"),
});

// Schema di validazione per registrazione esame
export const insertUserExamSchema = createInsertSchema(userExams).pick({
  examType: true,
  university: true,
  examDate: true,
  targetScore: true,
});

// Schema di validazione per creazione quiz
export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
  description: true,
  type: true,
  subjectId: true,
  timeLimit: true,
  isPremium: true,
}).extend({
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
export type StudyRecommendation = typeof studyRecommendations.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type UserChallengeCompletion = typeof userChallengeCompletions.$inferSelect;
export type LearningResource = typeof learningResources.$inferSelect;
