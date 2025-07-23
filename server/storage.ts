import {
  users, userExams, subscriptions, subjects, topics, questions, quizzes, 
  userQuizAttempts, studySessions, weakAreas, learningResources,
  type User, type InsertUser, type UserExam, type InsertUserExam,
  type Quiz, type InsertQuiz, type Question, type UserQuizAttempt,
  type Subject, type Topic, type StudySession, type WeakArea,
  type LearningResource
} from "@shared/schema";
import { supabase } from "./db";

export interface IStorage {
  // Utenti
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
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
  
  // Risorse di apprendimento
  getLearningResources(topicId?: number): Promise<LearningResource[]>;
  
  // Admin
  getUsers(): Promise<User[]>;
  promoteToAdmin(userId: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Utenti
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    
    // Map database fields to TypeScript interface
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      role: data.role,
      isPremium: data.is_premium,
      xpPoints: data.xp_points,
      lastActive: data.last_active ? new Date(data.last_active) : null,
      profileImage: data.profile_image,
      onboardingCompleted: data.onboarding_completed,
      preferences: data.preferences,
      createdAt: new Date(data.created_at)
    } as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();
      
    if (error || !data) return undefined;
    
    // Map database fields to TypeScript interface
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      role: data.role,
      isPremium: data.is_premium,
      xpPoints: data.xp_points,
      lastActive: data.last_active ? new Date(data.last_active) : null,
      profileImage: data.profile_image,
      onboardingCompleted: data.onboarding_completed,
      preferences: data.preferences,
      createdAt: new Date(data.created_at)
    } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();
      
    if (error || !data) return undefined;
    
    // Map database fields to TypeScript interface
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      role: data.role,
      isPremium: data.is_premium,
      xpPoints: data.xp_points,
      lastActive: data.last_active ? new Date(data.last_active) : null,
      profileImage: data.profile_image,
      onboardingCompleted: data.onboarding_completed,
      preferences: data.preferences,
      createdAt: new Date(data.created_at)
    } as User;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Authentication is now handled by Supabase Auth
    // This is only for creating a user record linked to an auth account
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        full_name: userData.fullName,
        role: "user",
        is_premium: false,
        xp_points: 0,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    // Map database response to TypeScript interface
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      role: data.role,
      isPremium: data.is_premium,
      xpPoints: data.xp_points,
      lastActive: data.last_active ? new Date(data.last_active) : null,
      profileImage: data.profile_image,
      onboardingCompleted: data.onboarding_completed,
      preferences: data.preferences,
      createdAt: new Date(data.created_at)
    } as User;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Map camelCase fields to snake_case for database
    const dbData: any = {};
    
    if (userData.fullName !== undefined) dbData.full_name = userData.fullName;
    if (userData.isPremium !== undefined) dbData.is_premium = userData.isPremium;
    if (userData.xpPoints !== undefined) dbData.xp_points = userData.xpPoints;
    if (userData.lastActive !== undefined) dbData.last_active = userData.lastActive;
    if (userData.profileImage !== undefined) dbData.profile_image = userData.profileImage;
    if (userData.onboardingCompleted !== undefined) dbData.onboarding_completed = userData.onboardingCompleted;
    if (userData.preferences !== undefined) dbData.preferences = userData.preferences;
    if (userData.email !== undefined) dbData.email = userData.email;
    if (userData.username !== undefined) dbData.username = userData.username;
    if (userData.role !== undefined) dbData.role = userData.role;
    
    const { data, error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    
    // Map database response back to TypeScript interface
    const mappedUser = {
      id: data.id,
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      role: data.role,
      isPremium: data.is_premium,
      xpPoints: data.xp_points,
      lastActive: data.last_active ? new Date(data.last_active) : null,
      profileImage: data.profile_image,
      onboardingCompleted: data.onboarding_completed,
      preferences: data.preferences,
      createdAt: new Date(data.created_at)
    };
    
    // Send real-time update to the user if connected via WebSocket
    if ((global as any).sendUserUpdate) {
      // Send user update via WebSocket
      (global as any).sendUserUpdate(id, {
        type: 'user_stats',
        user: mappedUser
      });
    }
    
    return mappedUser as User;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Prima ottieni l'auth_user_id dalla mappatura (se esiste)
      const { data: mappingData, error: mappingError } = await supabase
        .from('auth_user_mapping')
        .select('auth_user_id')
        .eq('user_id', id)
        .maybeSingle(); // Usa maybeSingle invece di single per gestire il caso di nessun risultato
      
      // Se esiste una mappatura, elimina l'utente da Supabase Auth
      if (mappingData && mappingData.auth_user_id) {
        const { error: authError } = await supabase.auth.admin.deleteUser(
          mappingData.auth_user_id
        );
        
        if (authError) {
          console.error('Error deleting user from auth:', authError);
          throw new Error(`Errore eliminazione da Auth: ${authError.message}`);
        }
      } else {
        console.log(`User ${id} has no auth mapping, skipping Supabase Auth deletion`);
      }
      
      // Elimina tutti i dati correlati all'utente dal database
      // Elimina i tentativi di quiz
      const { error: quizError } = await supabase
        .from('user_quiz_attempts')
        .delete()
        .eq('user_id', id);
      
      if (quizError) {
        console.error('Error deleting quiz attempts:', quizError);
        throw new Error(`Errore eliminazione tentativi quiz: ${quizError.message}`);
      }
      
      // Elimina le sessioni di studio
      const { error: studyError } = await supabase
        .from('study_sessions')
        .delete()
        .eq('user_id', id);
      
      if (studyError) {
        console.error('Error deleting study sessions:', studyError);
        throw new Error(`Errore eliminazione sessioni studio: ${studyError.message}`);
      }
      
      // Elimina le aree deboli
      const { error: weakError } = await supabase
        .from('weak_areas')
        .delete()
        .eq('user_id', id);
      
      if (weakError) {
        console.error('Error deleting weak areas:', weakError);
        throw new Error(`Errore eliminazione aree deboli: ${weakError.message}`);
      }
      
      // Elimina gli esami utente
      const { error: examError } = await supabase
        .from('user_exams')
        .delete()
        .eq('user_id', id);
      
      if (examError) {
        console.error('Error deleting user exams:', examError);
        throw new Error(`Errore eliminazione esami utente: ${examError.message}`);
      }
      
      // Elimina le sottoscrizioni
      const { error: subError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', id);
      
      if (subError) {
        console.error('Error deleting subscriptions:', subError);
        throw new Error(`Errore eliminazione sottoscrizioni: ${subError.message}`);
      }
      
      // Elimina i ticket di supporto
      const { error: ticketError } = await supabase
        .from('support_tickets')
        .delete()
        .eq('user_id', id);
      
      if (ticketError) {
        console.error('Error deleting support tickets:', ticketError);
        throw new Error(`Errore eliminazione ticket supporto: ${ticketError.message}`);
      }
      
      // Elimina la mappatura auth (se esiste)
      if (mappingData && mappingData.auth_user_id) {
        const { error: mappingDeleteError } = await supabase
          .from('auth_user_mapping')
          .delete()
          .eq('user_id', id);
        
        if (mappingDeleteError) {
          console.error('Error deleting auth mapping:', mappingDeleteError);
          throw new Error(`Errore eliminazione mappatura: ${mappingDeleteError.message}`);
        }
      } else {
        console.log(`User ${id} has no auth mapping to delete`);
      }
      
      // Infine elimina l'utente dal database locale
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (userError) {
        console.error('Error deleting user:', userError);
        throw new Error(`Errore eliminazione utente: ${userError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Rilancia l'errore invece di restituire false
    }
  }

  async loginUser(email: string, password: string): Promise<User | undefined> {
    // This is now handled by Supabase Auth
    // For backwards compatibility during migration, we'll keep this method
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError || !authData.user) return undefined;
    
    // Get the user record from our users table
    const { data, error } = await supabase
      .from('auth_user_mapping')
      .select('user_id')
      .eq('auth_user_id', authData.user.id)
      .single();
      
    if (error || !data) return undefined;
    
    return await this.getUser(data.user_id);
  }
  
  // Esami
  async getUserExam(userId: number): Promise<UserExam | undefined> {
    const { data, error } = await supabase
      .from('user_exams')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !data) return undefined;
    return data as UserExam;
  }

  async createUserExam(userId: number, examData: InsertUserExam): Promise<UserExam> {
    const { data, error } = await supabase
      .from('user_exams')
      .insert({
        ...examData,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as UserExam;
  }

  async updateUserExam(id: number, examData: Partial<UserExam>): Promise<UserExam | undefined> {
    const { data, error } = await supabase
      .from('user_exams')
      .update(examData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data as UserExam;
  }
  
  // Quiz e domande
  async getQuizzes(type?: string, subjectId?: number): Promise<Quiz[]> {
    let query = supabase.from('quizzes').select();
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data as Quiz[];
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const { data, error } = await supabase
      .from('quizzes')
      .select()
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Quiz;
  }

  async getQuestionsByTopic(topicId: number): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select()
      .eq('topic_id', topicId);
    
    if (error) throw new Error(error.message);
    return data as Question[];
  }

  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select()
      .eq('difficulty', difficulty);
    
    if (error) throw new Error(error.message);
    return data as Question[];
  }
  
  // Tentativi quiz
  async saveQuizAttempt(attempt: Partial<UserQuizAttempt>): Promise<UserQuizAttempt> {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .insert(attempt as any)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
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
          lastActive: new Date()
        });
        
        // If accuracy is below threshold, add to weak areas
        if (attempt.score && attempt.score < 70 && attempt.quizId) {
          const quiz = await this.getQuiz(attempt.quizId);
          if (quiz && quiz.subjectId) {
            // Check if weak area already exists
            const { data: existingWeakAreas, error: existingWeakAreasError } = await supabase
              .from('weak_areas')
              .select()
              .eq('user_id', attempt.userId)
              .eq('topic_id', quiz.subjectId);
            
            if (!existingWeakAreasError && existingWeakAreas && existingWeakAreas.length > 0) {
              // Update existing weak area
              await supabase
                .from('weak_areas')
                .update({
                  accuracy: attempt.score,
                  last_updated: new Date().toISOString()
                })
                .eq('id', existingWeakAreas[0].id);
            } else {
              // Create new weak area
              await supabase
                .from('weak_areas')
                .insert({
                  user_id: attempt.userId,
                  topic_id: quiz.subjectId,
                  accuracy: attempt.score,
                  last_updated: new Date().toISOString()
                });
            }
          }
        }
      }
    }
    
    return data as UserQuizAttempt;
  }
  

  async getUserQuizAttempts(userId: number): Promise<UserQuizAttempt[]> {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .select()
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data as UserQuizAttempt[];
  }
  
  // Statistiche e raccomandazioni
  async getWeakAreas(userId: number): Promise<WeakArea[]> {
    const { data, error } = await supabase
      .from('weak_areas')
      .select()
      .eq('user_id', userId)
      .order('accuracy', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data as WeakArea[];
  }


  
  // Risorse di apprendimento
  async getLearningResources(topicId?: number): Promise<LearningResource[]> {
    let query = supabase.from('learning_resources').select();
    
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data as LearningResource[];
  }
  
  // Admin
  async getUsers(search?: string): Promise<User[]> {
    let query = supabase
      .from('users')
      .select('*');

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    
    // Map database fields to TypeScript interface
    return data.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      password: user.password,
      fullName: user.full_name,
      role: user.role,
      isPremium: user.is_premium,
      xpPoints: user.xp_points,
      lastActive: user.last_active ? new Date(user.last_active) : null,
      profileImage: user.profile_image,
      onboardingCompleted: user.onboarding_completed,
      preferences: user.preferences,
      createdAt: new Date(user.created_at)
    })) as User[];
  }

  async promoteToAdmin(userId: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) return undefined;
    return data as User;
  }
}

export const storage = new DatabaseStorage();
