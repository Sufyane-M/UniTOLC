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
    // Initialize all user statistics to zero/default values
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        isPremium: false,
        role: "user",
        studyStreak: 0,
        xpPoints: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
    
    // Send real-time update to the user if connected via WebSocket
    if (user && (global as any).sendUserUpdate) {
      // Get updated user without password
      const { password, ...userWithoutPassword } = user;
      
      // Send user update via WebSocket
      (global as any).sendUserUpdate(id, {
        type: 'user_stats',
        user: userWithoutPassword
      });
    }
    
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
    
    // Update user statistics in real-time after completing a quiz attempt
    if (attempt.userId && attempt.completed) {
      // Calculate XP gained based on correct answers and quiz type
      const xpGained = attempt.correctAnswers || 0;
      
      // Get current user stats
      const user = await this.getUser(attempt.userId);
      if (user) {
        // Update user XP, lastActive and other relevant stats
        await this.updateUser(user.id, {
          xpPoints: (user.xpPoints || 0) + xpGained,
          lastActive: new Date().toISOString(),
          // Increment studyStreak if it's a new day since last activity
          studyStreak: this.shouldIncrementStreak(user.lastActive) 
            ? (user.studyStreak || 0) + 1 
            : user.studyStreak
        });
        
        // If accuracy is below threshold, add to weak areas
        if (attempt.score && attempt.score < 70 && attempt.quizId) {
          const quiz = await this.getQuiz(attempt.quizId);
          if (quiz && quiz.topicId) {
            // Check if weak area already exists
            const existingWeakAreas = await db
              .select()
              .from(weakAreas)
              .where(
                and(
                  eq(weakAreas.userId, attempt.userId),
                  eq(weakAreas.topicId, quiz.topicId)
                )
              );
            
            if (existingWeakAreas.length > 0) {
              // Update existing weak area
              await db
                .update(weakAreas)
                .set({
                  accuracy: attempt.score,
                  lastUpdated: new Date().toISOString()
                })
                .where(eq(weakAreas.id, existingWeakAreas[0].id));
            } else {
              // Create new weak area
              await db
                .insert(weakAreas)
                .values({
                  userId: attempt.userId,
                  topicId: quiz.topicId,
                  accuracy: attempt.score,
                  lastUpdated: new Date().toISOString()
                });
            }
          }
        }
      }
    }
    
    return newAttempt;
  }
  
  // Helper method to determine if streak should be incremented
  private shouldIncrementStreak(lastActive?: string): boolean {
    if (!lastActive) return true;
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    
    // Check if last active was yesterday (or earlier)
    const lastActiveDay = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const differenceInTime = today.getTime() - lastActiveDay.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    
    // Increment if last active was yesterday (streak continues) or if it's the first activity
    return differenceInDays === 1 || differenceInDays === 0;
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
    
    // Get the challenge details to award XP in real-time
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));
    
    if (challenge) {
      // Get current user stats
      const user = await this.getUser(userId);
      if (user) {
        // Award XP for completing the challenge and update lastActive
        await this.updateUser(user.id, {
          xpPoints: (user.xpPoints || 0) + (challenge.xpReward || 10),
          lastActive: new Date().toISOString(),
          // Also update study streak
          studyStreak: this.shouldIncrementStreak(user.lastActive) 
            ? (user.studyStreak || 0) + 1 
            : user.studyStreak
        });
      }
    }
    
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
