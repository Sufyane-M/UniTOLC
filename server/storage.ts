import { 
  users, userExams, subscriptions, subjects, topics, questions, quizzes, 
  userQuizAttempts, studySessions, weakAreas, studyRecommendations, 
  dailyChallenges, userChallengeCompletions, learningResources,
  type User, type InsertUser, type UserExam, type InsertUserExam,
  type Quiz, type InsertQuiz, type Question, type UserQuizAttempt,
  type Subject, type Topic, type StudySession, type WeakArea,
  type StudyRecommendation, type DailyChallenge, type UserChallengeCompletion,
  type LearningResource
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql, inArray, isNull, not, like } from "drizzle-orm";
import { hash, compare } from "bcrypt";

export interface IStorage {
  // Utenti
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  loginUser(email: string, password: string): Promise<User | undefined>;
  
  // Esami
  getUserExam(userId: number): Promise<UserExam | undefined>;
  createUserExam(userId: number, exam: InsertUserExam): Promise<UserExam>;
  updateUserExam(id: number, examData: Partial<UserExam>): Promise<UserExam | undefined>;
  
  // Quiz e domande
  getQuizzes(type?: string, subjectId?: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuestionsByTopic(topicId: number): Promise<Question[]>;
  getQuestionsByDifficulty(difficulty: string): Promise<Question[]>;
  
  // Tentativi quiz
  saveQuizAttempt(attempt: Partial<UserQuizAttempt>): Promise<UserQuizAttempt>;
  getUserQuizAttempts(userId: number): Promise<UserQuizAttempt[]>;
  
  // Statistiche e raccomandazioni
  getWeakAreas(userId: number): Promise<WeakArea[]>;
  getStudyRecommendations(userId: number): Promise<StudyRecommendation[]>;
  
  // Sfide giornaliere
  getDailyChallenges(date: Date): Promise<DailyChallenge[]>;
  completeChallenge(userId: number, challengeId: number): Promise<UserChallengeCompletion>;
  getUserCompletedChallenges(userId: number, date: Date): Promise<UserChallengeCompletion[]>;
  
  // Risorse di apprendimento
  getLearningResources(topicId?: number): Promise<LearningResource[]>;
  
  // Admin
  getUsers(): Promise<User[]>;
  promoteToAdmin(userId: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Utenti
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async loginUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    
    const isValid = await compare(password, user.password);
    if (!isValid) return undefined;
    
    return user;
  }
  
  // Esami
  async getUserExam(userId: number): Promise<UserExam | undefined> {
    const [exam] = await db
      .select()
      .from(userExams)
      .where(eq(userExams.userId, userId))
      .orderBy(desc(userExams.createdAt))
      .limit(1);
    return exam;
  }

  async createUserExam(userId: number, examData: InsertUserExam): Promise<UserExam> {
    const [exam] = await db
      .insert(userExams)
      .values({
        ...examData,
        userId
      })
      .returning();
    return exam;
  }

  async updateUserExam(id: number, examData: Partial<UserExam>): Promise<UserExam | undefined> {
    const [exam] = await db
      .update(userExams)
      .set(examData)
      .where(eq(userExams.id, id))
      .returning();
    return exam;
  }
  
  // Quiz e domande
  async getQuizzes(type?: string, subjectId?: number): Promise<Quiz[]> {
    let query = db.select().from(quizzes);
    
    if (type) {
      query = query.where(eq(quizzes.type, type));
    }
    
    if (subjectId) {
      query = query.where(eq(quizzes.subjectId, subjectId));
    }
    
    return await query;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuestionsByTopic(topicId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.topicId, topicId));
  }

  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.difficulty, difficulty));
  }
  
  // Tentativi quiz
  async saveQuizAttempt(attempt: Partial<UserQuizAttempt>): Promise<UserQuizAttempt> {
    const [newAttempt] = await db
      .insert(userQuizAttempts)
      .values(attempt as any)
      .returning();
    return newAttempt;
  }

  async getUserQuizAttempts(userId: number): Promise<UserQuizAttempt[]> {
    return await db
      .select()
      .from(userQuizAttempts)
      .where(eq(userQuizAttempts.userId, userId))
      .orderBy(desc(userQuizAttempts.startedAt));
  }
  
  // Statistiche e raccomandazioni
  async getWeakAreas(userId: number): Promise<WeakArea[]> {
    return await db
      .select()
      .from(weakAreas)
      .where(eq(weakAreas.userId, userId))
      .orderBy(weakAreas.accuracy);
  }

  async getStudyRecommendations(userId: number): Promise<StudyRecommendation[]> {
    return await db
      .select()
      .from(studyRecommendations)
      .where(eq(studyRecommendations.userId, userId));
  }
  
  // Sfide giornaliere
  async getDailyChallenges(date: Date): Promise<DailyChallenge[]> {
    return await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, date));
  }

  async completeChallenge(userId: number, challengeId: number): Promise<UserChallengeCompletion> {
    const [completion] = await db
      .insert(userChallengeCompletions)
      .values({
        userId,
        challengeId,
      })
      .returning();
    return completion;
  }

  async getUserCompletedChallenges(userId: number, date: Date): Promise<UserChallengeCompletion[]> {
    return await db
      .select()
      .from(userChallengeCompletions)
      .innerJoin(dailyChallenges, eq(userChallengeCompletions.challengeId, dailyChallenges.id))
      .where(
        and(
          eq(userChallengeCompletions.userId, userId),
          eq(dailyChallenges.date, date)
        )
      );
  }
  
  // Risorse di apprendimento
  async getLearningResources(topicId?: number): Promise<LearningResource[]> {
    let query = db.select().from(learningResources);
    
    if (topicId) {
      query = query.where(eq(learningResources.topicId, topicId));
    }
    
    return await query;
  }
  
  // Admin
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async promoteToAdmin(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
