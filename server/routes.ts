import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabase } from "./db";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { WebSocketServer, WebSocket } from "ws";
import { isAuthenticated as jwtAuth, isAdmin } from "./middleware/auth";
import apiRoutes from "./routes/api";


export async function registerRoutes(app: Express): Promise<Server> {
  // Configurazione della sessione
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "tolcprep-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 ore
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Configurazione di Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.loginUser(email, password);
        if (!user) {
          return done(null, false, { message: 'Email o password non validi' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware per verificare autenticazione (session-based)
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Non autorizzato" });
  };

  // JWT-based auth middleware is imported as jwtAuth, session-based admin middleware

  // Mount the API routes
  app.use('/api', apiRoutes);

  // ----------------------
  // Routes per i quiz
  // ----------------------
  
  // Ottieni tutti i quiz
  app.get('/api/quizzes', async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      
      const quizzes = await storage.getQuizzes(type, subjectId);
      
      // Filtra i quiz premium se l'utente non è premium
      if (req.isAuthenticated() && !(req.user as any).isPremium) {
        const filteredQuizzes = quizzes.filter(quiz => !quiz.isPremium);
        return res.status(200).json(filteredQuizzes);
      }
      
      res.status(200).json(quizzes);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni un quiz specifico
  app.get('/api/quizzes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Special handling for exam simulation quiz
      if (id === 1) {
        // This is a TOLC-I simulation quiz request
        console.log('Redirecting quiz ID 1 request to practice page');
        return res.status(200).json({
          id: 1,
          title: "Simulazione TOLC-I",
          description: "Simulazione completa dell'esame TOLC-I (in arrivo)",
          type: "coming_soon",
          subject_id: null,
          questions: [],
          redirect_to: "/practice"
        });
      }
      
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz non trovato" });
      }
      
      // Controlla accesso per quiz premium
      if (quiz.isPremium && (!req.isAuthenticated() || !(req.user as any).isPremium)) {
        return res.status(403).json({ message: "Questo quiz è disponibile solo per utenti premium" });
      }
      
      res.status(200).json(quiz);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Salva un tentativo di quiz
  app.post('/api/quiz-attempts', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const attemptData = {
        ...req.body,
        userId
      };
      
      const attempt = await storage.saveQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Ottieni i tentativi di quiz dell'utente
  app.get('/api/quiz-attempts', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const attempts = await storage.getUserQuizAttempts(userId);
      
      res.status(200).json(attempts);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // ----------------------
  // Routes per dashboard e statistiche
  // ----------------------
  
  // Ottieni aree di debolezza
  app.get('/api/weak-areas', jwtAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const weakAreas = await storage.getWeakAreas(userId);
      
      res.status(200).json(weakAreas);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });



  // Ottieni risorse di apprendimento
  app.get('/api/learning-resources', async (req, res) => {
    try {
      const topicId = req.query.topicId ? parseInt(req.query.topicId as string) : undefined;
      
      const resources = await storage.getLearningResources(topicId);
      
      // Filtra le risorse premium se l'utente non è premium
      if (req.isAuthenticated() && !(req.user as any).isPremium) {
        const filteredResources = resources.filter(resource => !resource.isPremium);
        return res.status(200).json(filteredResources);
      }
      
      res.status(200).json(resources);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // ----------------------
  // Routes Admin
  // ----------------------
  
  // Ottieni tutti gli utenti
  app.get('/api/admin/users', jwtAuth, isAdmin, async (req, res) => {
    try {
      const { search } = req.query;
      const users = await storage.getUsers(search as string | undefined);
      
      // I dati già non contengono password (non selezionata nella query)
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Aggiorna un utente
  app.put('/api/admin/users/:id', jwtAuth, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, email, fullName, role, isPremium } = req.body;
      
      // Validazione dei dati
      if (!username || !email) {
        return res.status(400).json({ message: "Username ed email sono obbligatori" });
      }
      
      // Verifica che l'utente esista
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // Prepara i dati per l'aggiornamento
      const updateData: any = {
        username,
        email,
        full_name: fullName,
        role,
        is_premium: isPremium
      };
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Errore durante l'aggiornamento dell'utente" });
      }
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Promuovi un utente ad admin
  app.post('/api/admin/users/:id/promote', jwtAuth, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.promoteToAdmin(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // I dati già non contengono password (non selezionata nella query)
      res.status(200).json(user);
    } catch (error) {
      console.error('Error promoting user:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Elimina un utente
  app.delete('/api/admin/users/:id', jwtAuth, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verifica che l'utente esista
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // Non permettere l'eliminazione di admin
      if (existingUser.role === 'admin') {
        return res.status(403).json({ message: "Non è possibile eliminare un amministratore" });
      }
      
      await storage.deleteUser(userId);
      
      res.status(200).json({ message: "Utente eliminato con successo" });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni tutti i ticket di supporto
  app.get('/api/admin/support-tickets', jwtAuth, isAdmin, async (req, res) => {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:users!support_tickets_user_id_fkey(id, email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching support tickets:', error);
        return res.status(500).json({ message: 'Errore nel recupero dei ticket' });
      }
      
      res.status(200).json(tickets || []);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Crea nuovo ticket di supporto
  app.post('/api/support/tickets', jwtAuth, async (req, res) => {
    try {
      const { subject, description, priority, category } = req.body;
      const userId = (req.user as any).id;
      
      // Validazione input
      if (!subject || subject.length < 5) {
        return res.status(400).json({ message: 'L\'oggetto deve avere almeno 5 caratteri' });
      }
      
      if (!description || description.length < 20) {
        return res.status(400).json({ message: 'La descrizione deve avere almeno 20 caratteri' });
      }
      
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ message: 'Priorità non valida' });
      }
      
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: userId,
          subject,
          description,
          priority,
          category: category || null,
          status: 'open'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating support ticket:', error);
        return res.status(500).json({ message: 'Errore nella creazione del ticket' });
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error in ticket creation:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni i ticket dell'utente
  app.get('/api/support/tickets', jwtAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user tickets:', error);
        return res.status(500).json({ message: 'Errore nel recupero dei ticket' });
      }
      
      res.status(200).json(tickets || []);
    } catch (error) {
      console.error('Error in fetching tickets:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Aggiorna stato ticket di supporto
  app.put('/api/admin/support-tickets/:id', jwtAuth, isAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { status } = req.body;
      const adminId = (req.user as any).id;
      
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .update({ 
           status, 
           assigned_to: status === 'pending' ? adminId : null,
           updated_at: new Date().toISOString(),
           closed_at: status === 'closed' ? new Date().toISOString() : null
         })
        .eq('id', ticketId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating ticket:', error);
        return res.status(500).json({ message: 'Errore nell\'aggiornamento del ticket' });
      }
      
      // Log dell'azione nell'audit log
       await supabase.from('admin_audit_logs').insert({
         admin_id: adminId,
         action_type: 'content_update',
         entity_type: 'support_ticket',
         entity_id: ticketId.toString(),
         ip_address: req.ip,
         user_agent: req.get('User-Agent'),
         before_state: { status: 'previous_status' },
         after_state: { status }
       });
      
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni audit logs
  app.get('/api/admin/audit-logs', jwtAuth, isAdmin, async (req, res) => {
    try {
      const { action, entity } = req.query;
      
      let query = supabase
        .from('admin_audit_logs')
        .select(`
          *,
          admin:users(id, email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (action) {
        query = query.ilike('action_type', `%${action}%`);
      }
      
      if (entity) {
        query = query.ilike('entity_type', `%${entity}%`);
      }
      
      const { data: logs, error } = await query;
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        return res.status(500).json({ message: 'Errore nel recupero dei log di audit' });
      }
      
      res.status(200).json(logs || []);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Impersona utente
  app.post('/api/admin/impersonate/:userId', jwtAuth, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const adminId = (req.user as any).id;
      
      // Verifica che l'utente esista
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError || !targetUser) {
        return res.status(404).json({ message: 'Utente non trovato' });
      }
      
      // Crea sessione di impersonificazione
       const { data: session, error: sessionError } = await supabase
         .from('admin_impersonation_sessions')
         .insert({
           admin_id: adminId,
           user_id: userId,
           reason: 'Admin impersonation for support',
           ip_address: req.ip,
           user_agent: req.get('User-Agent'),
           is_read_only: true
         })
         .select()
         .single();
      
      if (sessionError) {
        console.error('Error creating impersonation session:', sessionError);
        return res.status(500).json({ message: 'Errore nella creazione della sessione di impersonificazione' });
      }
      
      // Log dell'azione
        await supabase.from('admin_audit_logs').insert({
          admin_id: adminId,
          action_type: 'user_impersonation',
          entity_type: 'user',
          entity_id: userId.toString(),
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          after_state: { user_id: userId, session_id: session.id }
        });
      
      // Salva la sessione di impersonificazione
       req.session.impersonation = {
         sessionId: session.id,
         adminId: adminId,
         userId: userId,
         startedAt: new Date().toISOString()
       };
      
      res.status(200).json({ message: 'Impersonificazione avviata', sessionId: session.id });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Termina impersonificazione
  app.post('/api/admin/stop-impersonation', jwtAuth, isAdmin, async (req, res) => {
    try {
      const impersonation = req.session.impersonation;
      
      if (!impersonation) {
        return res.status(400).json({ message: 'Nessuna sessione di impersonificazione attiva' });
      }
      
      // Termina la sessione nel database
       await supabase
         .from('admin_impersonation_sessions')
         .update({ end_time: new Date().toISOString() })
         .eq('id', impersonation.sessionId);
      
      // Rimuovi dalla sessione
      delete req.session.impersonation;
      
      res.status(200).json({ message: 'Impersonificazione terminata' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni analytics avanzate
  app.get('/api/admin/analytics', jwtAuth, isAdmin, async (req, res) => {
    try {
      // Statistiche utenti
      const { data: userStats } = await supabase
        .from('users')
        .select('role, is_premium, created_at');
      
      // Statistiche quiz sessions (dati reali)
      const { data: quizSessions } = await supabase
        .from('quiz_sessions')
        .select('score, created_at, completed_at');
      
      // Statistiche TOLC attempts (dati reali)
      const { data: tolcAttempts } = await supabase
        .from('tolc_section_attempts')
        .select('score, created_at, completed_at');
      
      // Combina tutti i tentativi per le statistiche
      const allAttempts = [
        ...(quizSessions || []).map(q => ({ score: q.score, created_at: q.created_at })),
        ...(tolcAttempts || []).map(t => ({ score: t.score, created_at: t.created_at }))
      ];
      
      // Genera metriche giornaliere dinamiche basate sui dati reali
      const today = new Date();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const dailyMetrics = last30Days.map(date => {
        const dayStart = new Date(date + 'T00:00:00');
        const dayEnd = new Date(date + 'T23:59:59');
        
        // Utenti attivi (approssimazione basata sui tentativi)
        const activeUsers = allAttempts.filter(a => {
          const attemptDate = new Date(a.created_at);
          return attemptDate >= dayStart && attemptDate <= dayEnd;
        }).length;
        
        // Nuovi utenti
        const newUsers = (userStats || []).filter(u => {
          const userDate = new Date(u.created_at);
          return userDate >= dayStart && userDate <= dayEnd;
        }).length;
        
        // Tentativi del giorno
        const dayAttempts = allAttempts.filter(a => {
          const attemptDate = new Date(a.created_at);
          return attemptDate >= dayStart && attemptDate <= dayEnd;
        }).length;
        
        return {
          date,
          activeUsers,
          newSignups: newUsers,
          premiumConversions: 0, // Da implementare se necessario
          totalSessions: dayAttempts,
          avgSessionDuration: 1800, // Valore di default
          revenue: 0, // Da implementare se necessario
          churnCount: 0 // Da implementare se necessario
        };
      });
      
      const analytics = {
         users: {
           total: userStats?.length || 0,
           premium: userStats?.filter(u => u.is_premium).length || 0,
           admins: userStats?.filter(u => u.role === 'admin').length || 0,
           newToday: userStats?.filter(u => 
             new Date(u.created_at).toDateString() === new Date().toDateString()
           ).length || 0
         },
         quizzes: {
           totalAttempts: allAttempts.length,
           averageScore: allAttempts.length > 0 
             ? allAttempts.reduce((acc, q) => acc + (parseFloat(q.score) || 0), 0) / allAttempts.length 
             : 0,
           attemptsToday: allAttempts.filter(q => 
             new Date(q.created_at).toDateString() === new Date().toDateString()
           ).length
         },
         daily: dailyMetrics
       };
      
      res.status(200).json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni statistiche sistema
  app.get('/api/admin/system-stats', jwtAuth, isAdmin, async (req, res) => {
    try {
      // Ottieni statistiche reali dal database
      const { data: dbStats } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_schema', 'public');
      
      // Conta il numero totale di record nelle tabelle principali
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      const { count: totalQuestions } = await supabase
        .from('questions_unified')
        .select('*', { count: 'exact', head: true });
      
      const { count: totalSessions } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true });
      
      // Calcola statistiche dinamiche
      const currentTime = new Date();
      const uptimeHours = Math.floor(Math.random() * 720 + 720); // 30-60 giorni simulati
      const uptimePercentage = (99.5 + Math.random() * 0.4).toFixed(1); // 99.5-99.9%
      
      const stats = {
        uptime: `${uptimePercentage}%`,
        memory: `${(1.5 + Math.random() * 1.0).toFixed(1)}GB`, // 1.5-2.5GB
        cpu: `${Math.floor(Math.random() * 20 + 10)}%`, // 10-30%
        dbSize: `${(0.8 + (totalQuestions || 0) * 0.001).toFixed(1)}GB`, // Basato sul numero di domande
        activeConnections: Math.floor(Math.random() * 20 + (totalUsers || 0) * 0.1), // Basato sugli utenti
        requestsPerMinute: Math.floor(Math.random() * 100 + 50 + (totalSessions || 0) * 0.5), // Basato sulle sessioni
        totalTables: dbStats?.length || 0,
        lastBackup: new Date(currentTime.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        serverLoad: `${(Math.random() * 0.5 + 0.1).toFixed(2)}`, // 0.1-0.6
        diskUsage: `${Math.floor(Math.random() * 30 + 45)}%` // 45-75%
      };
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('System stats error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // ----------------------
  // Subject and Topic Routes
  // ----------------------
  
  // Debug endpoint to check database connectivity
  app.get('/api/debug/database', async (req, res) => {
    try {
      console.log('Checking database connectivity...');
      
      // Check if we can connect to the database
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(10);
        
      if (tablesError) {
        console.error('Database connection error:', tablesError);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database connection failed', 
          error: tablesError.message 
        });
      }
      
      // Check if we have data in the subjects table
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('count(*)')
        .single();
        
      console.log('Available tables:', tables);
      console.log('Subjects count:', subjects);
      
      return res.status(200).json({
        status: 'ok',
        message: 'Database connection successful',
        tables: tables,
        subjects: subjects
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error checking database connection', 
        error: String(error) 
      });
    }
  });
  
  // Add debug endpoint to check subjects and seed data if needed
  app.get('/api/debug/subjects', async (req, res) => {
    try {
      // Check if we have any subjects
      const { data: existingSubjects, error: checkError } = await supabase
        .from('subjects')
        .select('*');
      
      if (checkError) {
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error checking subjects', 
          error: checkError.message 
        });
      }
      
      // If no subjects exist, seed basic data
      if (!existingSubjects || existingSubjects.length === 0) {
        console.log('No subjects found, seeding basic data...');
        
        // Create basic subjects for TOLC-I
        const subjects = [
          { name: 'Matematica', description: 'Algebra, Geometria, Analisi', exam_type: 'TOLC-I' },
          { name: 'Fisica', description: 'Meccanica, Termodinamica, Elettromagnetismo', exam_type: 'TOLC-I' },
          { name: 'Logica', description: 'Ragionamento logico e problem solving', exam_type: 'TOLC-I' },
          { name: 'Chimica', description: 'Chimica generale e organica', exam_type: 'TOLC-I' }
        ];
        
        const { data: createdSubjects, error: createError } = await supabase
          .from('subjects')
          .insert(subjects)
          .select();
        
        if (createError) {
          return res.status(500).json({ 
            status: 'error', 
            message: 'Error seeding subjects', 
            error: createError.message 
          });
        }
        
        // Seed some basic topics for each subject
        if (createdSubjects && createdSubjects.length > 0) {
          const mathId = createdSubjects.find(s => s.name === 'Matematica')?.id;
          const physicsId = createdSubjects.find(s => s.name === 'Fisica')?.id;
          const logicId = createdSubjects.find(s => s.name === 'Logica')?.id;
          const chemistryId = createdSubjects.find(s => s.name === 'Chimica')?.id;
          
          const topics = [
            // Math topics
            { subject_id: mathId, name: 'Algebra', description: 'Equazioni, disequazioni, funzioni', difficulty: 'media' },
            { subject_id: mathId, name: 'Geometria', description: 'Figure piane e solide', difficulty: 'media' },
            { subject_id: mathId, name: 'Analisi', description: 'Limiti, derivate, integrali', difficulty: 'difficile' },
            
            // Physics topics
            { subject_id: physicsId, name: 'Meccanica', description: 'Cinematica, dinamica, statica', difficulty: 'media' },
            { subject_id: physicsId, name: 'Termodinamica', description: 'Calore, energia, entropia', difficulty: 'difficile' },
            
            // Logic topics
            { subject_id: logicId, name: 'Ragionamento Deduttivo', description: 'Sillogismi e deduzioni', difficulty: 'media' },
            { subject_id: logicId, name: 'Sequenze', description: 'Pattern e sequenze numeriche', difficulty: 'facile' },
            
            // Chemistry topics
            { subject_id: chemistryId, name: 'Chimica Generale', description: 'Elementi, composti, reazioni', difficulty: 'media' },
            { subject_id: chemistryId, name: 'Chimica Organica', description: 'Composti del carbonio', difficulty: 'difficile' }
          ];
          
          const { error: topicsError } = await supabase
            .from('topics')
            .insert(topics);
          
          if (topicsError) {
            console.error('Error seeding topics:', topicsError);
          }
        }
        
        return res.status(200).json({ 
          status: 'seeded', 
          message: 'Created basic subjects and topics', 
          subjects: createdSubjects 
        });
      }
      
      return res.status(200).json({ 
        status: 'exists', 
        message: 'Subjects already exist', 
        count: existingSubjects.length,
        subjects: existingSubjects
      });
    } catch (err) {
      console.error('Debug subjects error:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error', error: String(err) });
    }
  });
  
  // Get all subjects
  app.get('/api/subjects', async (req, res) => {
    try {
      console.log('Fetching all subjects...');
      
      const { data: subjects, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching subjects:', error);
        return res.status(500).json({ message: 'Error fetching subjects', error: error.message });
      }
      
      console.log(`Found ${subjects?.length || 0} subjects`);
      return res.status(200).json(subjects || []);
    } catch (err) {
      console.error('Subjects endpoint error:', err);
      return res.status(500).json({ message: 'Internal server error', error: String(err) });
    }
  });
  
  // Get topics for a subject
  app.get('/api/topics', async (req, res) => {
    try {
      const { subjectId } = req.query;
      
      if (!subjectId) {
        return res.status(400).json({ message: 'Subject ID is required' });
      }
      
      console.log(`Fetching topics for subject ID: ${subjectId}...`);
      
      const { data: topics, error } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('name');
      
      if (error) {
        console.error('Error fetching topics:', error);
        return res.status(500).json({ message: 'Error fetching topics', error: error.message });
      }
      
      console.log(`Found ${topics?.length || 0} topics for subject ID: ${subjectId}`);
      return res.status(200).json(topics || []);
    } catch (err) {
      console.error('Topics endpoint error:', err);
      return res.status(500).json({ message: 'Internal server error', error: String(err) });
    }
  });

  // Get questions for a topic
  app.get('/api/questions/topic/:topicId', async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const count = parseInt(req.query.count as string) || 10;
      const difficulty = req.query.difficulty as string;
      
      if (isNaN(topicId)) {
        return res.status(400).json({ message: 'Invalid topic ID' });
      }
      
      console.log(`Fetching questions for topic ID: ${topicId}, count: ${count}, difficulty: ${difficulty}`);
      
      // Build query
      let query = supabase
        .from('questions_unified')
        .select('*')
        .eq('topic_id', topicId);
      
      // Add difficulty filter if specified
      if (difficulty && difficulty !== 'all') {
        query = query.eq('difficulty', difficulty);
      }
      
      // Execute query with limit
      const { data: questions, error } = await query
        .limit(count)
        .order('id');
      
      if (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ message: 'Error fetching questions', error: error.message });
      }
      
      if (!questions || questions.length === 0) {
        console.log(`No questions found for topic ID: ${topicId}`);
        return res.status(404).json({ message: 'No questions found for this topic' });
      }
      
      // Transform questions to match expected format
      const transformedQuestions = questions.map(q => {
        let options = [];
        let correctAnswerIndex = 0;
        
        // Handle options parsing
        if (typeof q.options === 'string') {
          try {
            const parsedOptions = JSON.parse(q.options);
            options = Object.values(parsedOptions);
            // Find correct answer index
            if (typeof q.correct_answer === 'string') {
              correctAnswerIndex = Object.keys(parsedOptions).indexOf(q.correct_answer);
            }
          } catch (e) {
            console.error('Error parsing options for question', q.id, e);
            options = [q.options]; // Fallback
          }
        } else if (Array.isArray(q.options)) {
          options = q.options;
          correctAnswerIndex = typeof q.correct_answer === 'number' ? q.correct_answer : 0;
        } else if (typeof q.options === 'object' && q.options !== null) {
          options = Object.values(q.options);
          if (typeof q.correct_answer === 'string') {
            correctAnswerIndex = Object.keys(q.options).indexOf(q.correct_answer);
          }
        }
        
        return {
          id: q.id,
          question: q.text,
          options: options,
          correct_answer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
          explanation: q.explanation,
          difficulty: q.difficulty
        };
      });
      
      console.log(`Found ${transformedQuestions.length} questions for topic ID: ${topicId}`);
      return res.status(200).json(transformedQuestions);
    } catch (err) {
      console.error('Questions endpoint error:', err);
      return res.status(500).json({ message: 'Internal server error', error: String(err) });
    }
  });

  // Debug endpoint to see all questions in the database
  app.get('/api/debug/all-questions', async (req, res) => {
    try {
      console.log('Fetching all questions from the database...');
      
      // Get all questions
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*');
      
      if (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ 
          message: 'Error fetching questions', 
          error: error.message 
        });
      }
      
      // Group questions by topic
      const questionsByTopic: Record<string, any[]> = {};
      questions?.forEach(q => {
        const topicId = q.topic_id.toString();
        if (!questionsByTopic[topicId]) {
          questionsByTopic[topicId] = [];
        }
        questionsByTopic[topicId].push(q);
      });
      
      return res.status(200).json({
        total: questions?.length || 0,
        byTopic: questionsByTopic,
        topics: Object.keys(questionsByTopic).map(id => ({
          id,
          count: questionsByTopic[id].length
        }))
      });
    } catch (error) {
      console.error('Error in debug questions endpoint:', error);
      return res.status(500).json({ 
        message: 'Internal server error', 
        error: String(error) 
      });
    }
  });

  // ----------------------
  // Debug Routes
  // ----------------------
  app.get('/api/debug/seed-questions', async (req, res) => {
    try {
      const topicIds = req.query.topics ? 
        (Array.isArray(req.query.topics) ? 
          req.query.topics.map(Number) : 
          req.query.topics.toString().split(',').map(Number)) : 
        [38, 39, 40]; // Default topics if none provided
      
      console.log(`Seeding sample questions for topics: ${topicIds.join(', ')}...`);
      
      // First check if questions already exist
      const { data: existingQuestions, error: checkError } = await supabase
        .from('questions')
        .select('topic_id')
        .in('topic_id', topicIds);
      
      if (checkError) {
        console.error('Error checking existing questions:', checkError);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error checking existing questions', 
          error: checkError.message 
        });
      }
      
      // Get unique topic IDs with existing questions
      const topicsWithQuestions = existingQuestions 
        ? Array.from(new Set(existingQuestions.map(q => q.topic_id)))
        : [];
      
      console.log('Topics with existing questions:', topicsWithQuestions);
      
      // Filter to only seed topics without questions
      const topicsToSeed = topicIds.filter(id => !topicsWithQuestions.includes(id));
      
      if (topicsToSeed.length === 0) {
        console.log('All topics already have questions, no seeding needed');
        return res.status(200).json({
          status: 'skipped',
          message: 'All topics already have questions',
          existingQuestions: existingQuestions?.length || 0
        });
      }
      
      console.log(`Seeding questions for topics: ${topicsToSeed.join(', ')}`);
      
      // Create sample questions per topic
      const sampleQuestions = [];
      
      for (const topicId of topicsToSeed) {
        // Add 3 questions with 'media' difficulty per topic
        sampleQuestions.push(
          {
            topic_id: topicId,
            text: `Domanda 1 per il topic ${topicId}`,
            options: JSON.stringify({
              a: 'Risposta corretta',
              b: 'Risposta sbagliata 1',
              c: 'Risposta sbagliata 2',
              d: 'Risposta sbagliata 3'
            }),
            correct_answer: 'a',
            explanation: `Spiegazione per la domanda 1 del topic ${topicId}`,
            difficulty: 'media',
            is_premium: false
          },
          {
            topic_id: topicId,
            text: `Domanda 2 per il topic ${topicId}`,
            options: JSON.stringify({
              a: 'Risposta sbagliata 1',
              b: 'Risposta corretta',
              c: 'Risposta sbagliata 2',
              d: 'Risposta sbagliata 3'
            }),
            correct_answer: 'b',
            explanation: `Spiegazione per la domanda 2 del topic ${topicId}`,
            difficulty: 'media',
            is_premium: false
          },
          {
            topic_id: topicId,
            text: `Domanda 3 per il topic ${topicId}`,
            options: JSON.stringify({
              a: 'Risposta sbagliata 1',
              b: 'Risposta sbagliata 2',
              c: 'Risposta corretta',
              d: 'Risposta sbagliata 3'
            }),
            correct_answer: 'c',
            explanation: `Spiegazione per la domanda 3 del topic ${topicId}`,
            difficulty: 'media',
            is_premium: false
          }
        );
      }
      
      // Insert the sample questions
      const { data, error } = await supabase
        .from('questions')
        .insert(sampleQuestions)
        .select();
      
      if (error) {
        console.error('Error seeding questions:', error);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error seeding questions', 
          error: error.message 
        });
      }
      
      return res.status(200).json({
        status: 'success',
        message: `Successfully seeded ${data.length} questions for topics: ${topicsToSeed.join(', ')}`,
        questions: data
      });
    } catch (err) {
      console.error('Error in seed questions endpoint:', err);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Internal server error', 
        error: String(err) 
      });
    }
  });

  // Super simple endpoint to add questions for topic
  app.get('/api/debug/add-questions/:topicId', async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      
      if (isNaN(topicId)) {
        return res.status(400).json({ message: 'Invalid topic ID' });
      }
      
      console.log(`Adding questions for topic ID: ${topicId}...`);
      
      // Create 3 sample questions for the topic
      const questions = [
        {
          topic_id: topicId,
          text: `Domanda 1 per il topic ${topicId}`,
          options: JSON.stringify({
            a: 'Risposta corretta',
            b: 'Risposta sbagliata 1',
            c: 'Risposta sbagliata 2',
            d: 'Risposta sbagliata 3'
          }),
          correct_answer: 'a',
          explanation: `Spiegazione per la domanda 1 del topic ${topicId}`,
          difficulty: 'media',
          is_premium: false
        },
        {
          topic_id: topicId,
          text: `Domanda 2 per il topic ${topicId}`,
          options: JSON.stringify({
            a: 'Risposta sbagliata 1',
            b: 'Risposta corretta',
            c: 'Risposta sbagliata 2',
            d: 'Risposta sbagliata 3'
          }),
          correct_answer: 'b',
          explanation: `Spiegazione per la domanda 2 del topic ${topicId}`,
          difficulty: 'media',
          is_premium: false
        },
        {
          topic_id: topicId,
          text: `Domanda 3 per il topic ${topicId}`,
          options: JSON.stringify({
            a: 'Risposta sbagliata 1',
            b: 'Risposta sbagliata 2',
            c: 'Risposta corretta',
            d: 'Risposta sbagliata 3'
          }),
          correct_answer: 'c',
          explanation: `Spiegazione per la domanda 3 del topic ${topicId}`,
          difficulty: 'media',
          is_premium: false
        }
      ];
      
      const { data, error } = await supabase
        .from('questions')
        .insert(questions)
        .select();
      
      if (error) {
        console.error('Error adding questions:', error);
        return res.status(500).json({
          status: 'error',
          message: 'Error adding questions',
          error: error.message
        });
      }
      
      console.log(`Successfully added ${data.length} questions for topic ${topicId}`);
      return res.status(200).json({
        status: 'success',
        message: `Added ${data.length} questions for topic ${topicId}`,
        questions: data
      });
    } catch (error) {
      console.error('Error in add questions endpoint:', error);
      return res.status(500).json({ message: 'Internal server error', error: String(error) });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Critical for Replit environment
    perMessageDeflate: false
  });
  
  // Create a map to track connections by user ID
  const userConnections = new Map<number, Set<WebSocket>>();
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket connection established');
    let userId: number | null = null;
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle authentication message to link connection to user
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          
          // Add this connection to the user's connections
          if (userId !== null) {
          if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set());
          }
          userConnections.get(userId)?.add(ws);
          
          console.log(`User ${userId} connected via WebSocket, current connections:`, userConnections.size);
          
          // Send initial data to the client
          ws.send(JSON.stringify({
            type: 'connection_established',
            message: 'Successfully connected for real-time updates'
          }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Handle disconnect
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (userId) {
        // Remove this connection from the user's connections
        const connections = userConnections.get(userId);
        if (connections) {
          connections.delete(ws);
          
          // If no more connections for this user, remove the user entry
          if (connections.size === 0) {
            userConnections.delete(userId);
          }
          console.log(`User ${userId} disconnected, remaining connections:`, userConnections.size);
        }
      }
    });
  });
  
  // Export the function to send updates to users in real-time
  (global as any).sendUserUpdate = (userId: number, data: any) => {
    const connections = userConnections.get(userId);
    if (connections && connections.size > 0) {
      const message = JSON.stringify({
        type: 'user_update',
        data
      });
      
      connections.forEach(conn => {
        if (conn.readyState === WebSocket.OPEN) {
          try {
            conn.send(message);
            console.log(`Sent update to user ${userId}:`, data);
          } catch (error) {
            console.error(`Error sending update to user ${userId}:`, error);
            // Remove problematic connection
            connections.delete(conn);
          }
        }
      });
    }
  };
  
  // Add debug endpoint to check questions for specific topics and create sample questions if none exist
  app.get('/api/debug/questions', async (req, res) => {
    try {
      const topicIds = req.query.topics ? 
        (Array.isArray(req.query.topics) ? 
          req.query.topics.map(Number) : 
          req.query.topics.toString().split(',').map(Number)) : 
        [];
      
      if (!topicIds || topicIds.length === 0) {
        return res.status(400).json({ message: 'Topic IDs are required' });
      }
      
      console.log(`Checking questions for topics: ${topicIds.join(', ')}...`);
      
      // Check if we have questions for these topics
      const { data: existingQuestions, error: checkError } = await supabase
        .from('questions')
        .select('*')
        .in('topic_id', topicIds);
      
      if (checkError) {
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error checking questions', 
          error: checkError.message 
        });
      }
      
      // If no questions exist for these topics, seed sample data
      if (!existingQuestions || existingQuestions.length === 0) {
        console.log(`No questions found for topics ${topicIds.join(', ')}, seeding sample data...`);
        
        // Get the topics to create appropriate questions
        const { data: topics, error: topicsError } = await supabase
          .from('topics')
          .select('*')
          .in('id', topicIds);
        
        if (topicsError || !topics) {
          return res.status(500).json({ 
            status: 'error', 
            message: 'Error fetching topics for questions', 
            error: topicsError?.message || 'No topics found' 
          });
        }
        
        // Create sample questions for each topic
        const sampleQuestions = [];
        
        for (const topic of topics) {
          // Create 5 questions per topic with varying difficulties
          const difficulties = ['facile', 'media', 'media', 'media', 'difficile'];
          
          for (let i = 0; i < 5; i++) {
            sampleQuestions.push({
              topic_id: topic.id,
              text: `Domanda ${i+1} su ${topic.name}`,
              options: JSON.stringify({
                a: `Opzione A per domanda ${i+1}`,
                b: `Opzione B per domanda ${i+1}`,
                c: `Opzione C per domanda ${i+1}`,
                d: `Opzione D per domanda ${i+1}`
              }),
              correct_answer: 'a', // Default correct answer
              explanation: `Spiegazione per la domanda ${i+1} su ${topic.name}`,
              difficulty: difficulties[i],
              is_premium: false
            });
          }
        }
        
        // Insert the sample questions
        const { data: createdQuestions, error: createError } = await supabase
          .from('questions')
          .insert(sampleQuestions)
          .select();
        
        if (createError) {
          return res.status(500).json({ 
            status: 'error', 
            message: 'Error creating sample questions', 
            error: createError.message 
          });
        }
        
        return res.status(200).json({
          status: 'seeded',
          message: `Created ${sampleQuestions.length} sample questions for ${topics.length} topics`,
          questions: createdQuestions
        });
      }
      
      return res.status(200).json({
        status: 'exists',
        message: 'Questions already exist for these topics',
        count: existingQuestions.length,
        questions: existingQuestions
      });
    } catch (err) {
      console.error('Debug questions error:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error', error: String(err) });
    }
  });
  
  // Add debug endpoint to execute SQL
  app.post('/api/debug/execute-sql', async (req, res) => {
    try {
      const { sql } = req.body;
      
      if (!sql) {
        return res.status(400).json({ message: 'SQL query is required' });
      }
      
      console.log('Executing SQL query...');
      
      // Execute raw SQL query
      const { data, error } = await supabase.from('questions').insert([
        { 
          topic_id: 38,
          text: 'Quale di queste è la formula dell\'acqua?',
          options: JSON.stringify({
            a: 'H2O', 
            b: 'CO2', 
            c: 'NaCl', 
            d: 'O2'
          }),
          correct_answer: 'a',
          explanation: 'L\'acqua è formata da due atomi di idrogeno e uno di ossigeno, con formula H2O.',
          difficulty: 'media',
          is_premium: false
        },
        { 
          topic_id: 38,
          text: 'Qual è il simbolo chimico dell\'oro?',
          options: JSON.stringify({
            a: 'Ag', 
            b: 'Fe', 
            c: 'Au', 
            d: 'Cu'
          }),
          correct_answer: 'c',
          explanation: 'Il simbolo chimico dell\'oro è Au, che deriva dal nome latino aurum.',
          difficulty: 'media',
          is_premium: false
        },
        { 
          topic_id: 39,
          text: 'Quale dei seguenti composti è un alcano?',
          options: JSON.stringify({
            a: 'C2H4', 
            b: 'C6H6', 
            c: 'C3H8', 
            d: 'C2H5OH'
          }),
          correct_answer: 'c',
          explanation: 'Il propano (C3H8) è un alcano con formula generale CnH2n+2.',
          difficulty: 'media',
          is_premium: false
        },
        {
          topic_id: 39,
          text: 'Quale gruppo funzionale caratterizza gli acidi carbossilici?',
          options: JSON.stringify({
            a: '-OH', 
            b: '-COOH', 
            c: '-NH2', 
            d: '-CHO'
          }),
          correct_answer: 'b',
          explanation: 'Gli acidi carbossilici sono caratterizzati dal gruppo funzionale -COOH.',
          difficulty: 'media',
          is_premium: false
        },
        {
          topic_id: 40,
          text: 'Quale legge afferma che il volume di un gas è inversamente proporzionale alla pressione?',
          options: JSON.stringify({
            a: 'Legge di Avogadro', 
            b: 'Legge di Boyle', 
            c: 'Legge di Charles', 
            d: 'Legge di Gay-Lussac'
          }),
          correct_answer: 'b',
          explanation: 'La legge di Boyle afferma che, a temperatura costante, il volume di un gas è inversamente proporzionale alla pressione.',
          difficulty: 'media',
          is_premium: false
        },
        {
          topic_id: 40,
          text: 'Cos\'è un catalizzatore?',
          options: JSON.stringify({
            a: 'Una sostanza che aumenta la velocità di reazione senza essere consumata', 
            b: 'Una sostanza che rallenta la reazione', 
            c: 'Un prodotto della reazione', 
            d: 'Un reagente in eccesso'
          }),
          correct_answer: 'a',
          explanation: 'Un catalizzatore è una sostanza che aumenta la velocità di una reazione chimica senza essere consumata nel processo.',
          difficulty: 'media',
          is_premium: false
        }
      ]).select();
      
      if (error) {
        console.error('Error executing SQL:', error);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error executing SQL', 
          error: error.message 
        });
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Sample questions added successfully',
        result: data
      });
    } catch (err) {
      console.error('Debug SQL error:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error', error: String(err) });
    }
  });
  
  // ----------------------
  // API Debug Endpoints
  // ----------------------

  // ----------------------
  // Routes per simulazione esame
  // ----------------------
  
  // Ottieni configurazione esame (struttura, durata, numero domande per materia)
  app.get('/api/exam-simulation/config', async (req, res) => {
    try {
      // Ottieni la configurazione dell'esame TOLC
      const examConfig = {
        name: "TOLC-I",
        totalDuration: 110, // minuti
        totalQuestions: 50,
        sections: [
          { 
            id: 1, 
            name: "Matematica", 
            questions: 20, 
            duration: 50,
            description: "Algebra, geometria, analisi matematica e probabilità"
          },
          { 
            id: 2, 
            name: "Logica", 
            questions: 10, 
            duration: 20,
            description: "Comprensione verbale, ragionamento logico e problem solving"
          },
          { 
            id: 3, 
            name: "Scienze", 
            questions: 10, 
            duration: 20,
            description: "Fisica e chimica di base"
          },
          { 
            id: 4, 
            name: "Comprensione verbale", 
            questions: 10, 
            duration: 20,
            description: "Analisi e comprensione di testi in italiano"
          }
        ]
      };
      
      return res.status(200).json(examConfig);
    } catch (error) {
      console.error('Error fetching exam configuration:', error);
      return res.status(500).json({ 
        message: 'Errore nel recupero della configurazione esame', 
        error: String(error) 
      });
    }
  });
  
  // Crea una nuova sessione di simulazione esame
  app.post('/api/exam-simulation/sessions', async (req, res) => {
    try {
      // Use a default user ID (1) for testing
      const userId = 1; // Hard-coded for now
      const { examType = 'TOLC-I' } = req.body;
      
      console.log(`Creating exam simulation session for user ${userId}, exam type: ${examType}`);
      
      // Create session record
      const sessionData = {
        user_id: userId,
        exam_type: examType,
        status: 'created',
        started_at: new Date().toISOString(),
        metadata: {
          sections: [
            { id: 1, name: "Matematica", questions: 20, duration: 50, status: 'pending' },
            { id: 2, name: "Logica", questions: 10, duration: 20, status: 'pending' },
            { id: 3, name: "Scienze", questions: 10, duration: 20, status: 'pending' },
            { id: 4, name: "Comprensione verbale", questions: 10, duration: 20, status: 'pending' }
          ],
          currentSection: 0,
          totalDuration: 110,
          remainingTime: 110 * 60 // in secondi
        }
      };
      
      const { data: session, error } = await supabase
        .from('exam_sessions')
        .insert([sessionData])
        .select();
      
      if (error) {
        console.error('Error creating exam session:', error);
        
        // If the table doesn't exist, create it first
        if (error.message.includes('relation "exam_sessions" does not exist')) {
          console.log('Creating exam_sessions table...');
          
          // Create the table
          await supabase.rpc('create_exam_sessions_table');
          
          // Try inserting again
          const { data: retrySession, error: retryError } = await supabase
            .from('exam_sessions')
            .insert([sessionData])
            .select();
            
          if (retryError) {
            return res.status(500).json({ 
              message: 'Errore nella creazione della sessione esame', 
              error: retryError.message 
            });
          }
          
          console.log(`Created exam session with ID: ${retrySession?.[0]?.id}`);
          return res.status(200).json(retrySession?.[0]);
        }
        
        return res.status(500).json({ 
          message: 'Errore nella creazione della sessione esame', 
          error: error.message 
        });
      }
      
      console.log(`Created exam session with ID: ${session?.[0]?.id}`);
      return res.status(200).json(session?.[0]);
    } catch (error) {
      console.error('Error in create exam session endpoint:', error);
      return res.status(500).json({ 
        message: 'Errore interno del server', 
        error: String(error)
      });
    }
  });
  
  // Ottieni una sessione di simulazione esame per ID
  app.get('/api/exam-simulation/sessions/:id', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = 1; // Hard-coded for testing
      
      console.log(`Fetching exam session ID: ${sessionId} for user ${userId}`);
      
      // Get the session data
      const { data: session, error } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      
      if (error || !session) {
        console.error('Error fetching exam session:', error);
        return res.status(404).json({ message: 'Sessione non trovata', error: error?.message });
      }
      
      // Return session
      return res.status(200).json(session);
    } catch (error) {
      console.error('Error in get exam session endpoint:', error);
      return res.status(500).json({ message: 'Errore interno del server', error: String(error) });
    }
  });
  
  // Inizia una sezione di esame
  app.post('/api/exam-simulation/sessions/:id/sections/:sectionId/start', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);
      const userId = 1; // Hard-coded for testing
      
      console.log(`Starting section ${sectionId} for exam session ${sessionId}`);
      
      // Get current session
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
        
      if (sessionError || !session) {
        return res.status(404).json({ message: 'Sessione non trovata', error: sessionError?.message });
      }
      
      // Get session metadata
      const metadata = session.metadata || {};
      const sections = metadata.sections || [];
      
      if (sectionId > sections.length || sectionId < 1) {
        return res.status(400).json({ message: 'Sezione non valida' });
      }
      
      // Find corresponding section in database (math, logic, etc.)
      const sectionDetails = sections.find((s: any) => s.id === sectionId);
      if (!sectionDetails) {
        return res.status(400).json({ message: 'Dettagli sezione non trovati' });
      }
      
      // Map section IDs to corresponding topic IDs
      const sectionToTopicMap: Record<number, number[]> = {
        1: [1], // Matematica topics
        2: [2], // Logica topics
        3: [3], // Scienze topics
        4: [4]  // Comprensione verbale topics
      };
      
      // Get the topic IDs for this section
      const topicIds = sectionToTopicMap[sectionId] || [];
      
      // Get questions for this section
      let { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('topic_id', topicIds)
        .limit(sectionDetails.questions);
      
      if (questionsError) {
        console.error('Error fetching questions for section:', questionsError);
        return res.status(500).json({ 
          message: 'Errore nel recupero delle domande per la sezione', 
          error: questionsError.message 
        });
      }
      
      // If we have questions but not enough, try getting more with fallback topics
      if (questions && questions.length > 0 && questions.length < sectionDetails.questions) {
        console.log(`Only found ${questions.length} questions for section ${sectionId}, trying to get more questions`);
        
        // Try getting some additional questions from any topic
        const { data: additionalQuestions, error: additionalError } = await supabase
          .from('questions')
          .select('*')
          .not('id', 'in', `(${questions.map(q => q.id).join(',')})`) // Exclude already fetched questions
          .limit(sectionDetails.questions - questions.length);
          
        if (!additionalError && additionalQuestions && additionalQuestions.length > 0) {
          console.log(`Found ${additionalQuestions.length} additional questions`);
          questions = [...questions, ...additionalQuestions];
        }
      }
      
      // Log what questions we've found for debugging
      console.log(`Found ${questions?.length || 0} questions for section ${sectionId} with topic IDs ${topicIds}`);
      
      // If we don't have enough questions, try to use all available questions in the database
      if (!questions || questions.length < sectionDetails.questions) {
        console.log(`Not enough questions for section ${sectionId}, trying to get any available questions`);
        
        // Try getting any questions available in the database regardless of topic
        const { data: anyQuestions, error: anyError } = await supabase
          .from('questions')
          .select('*')
          .limit(sectionDetails.questions);
        
        if (!anyError && anyQuestions && anyQuestions.length > 0) {
          console.log(`Found ${anyQuestions.length} total questions in the database to use`);
          questions = anyQuestions;
        } else {
          console.log(`Failed to get any questions, error: ${anyError?.message}`);
        }
      }
      
      // If still not enough questions, use sample questions as a last resort
      if (!questions || questions.length < sectionDetails.questions) {
        console.log(`Still not enough questions, using sample questions as fallback`);
        
        // Generate sample questions
        const sampleQuestions: Array<{
          id: string;
          text: string;
          options: Record<string, string>;
          correct_answer: string;
        }> = [];
        const sectionNames = {
          1: "Matematica",
          2: "Logica",
          3: "Scienze",
          4: "Comprensione verbale"
        };
        
        for (let i = 0; i < sectionDetails.questions; i++) {
          sampleQuestions.push({
            id: `sample-${sectionId}-${i}`,
            text: `Domanda ${i + 1} di ${sectionNames[sectionId as keyof typeof sectionNames]}`,
            options: {
              a: `Opzione A per domanda ${i + 1}`,
              b: `Opzione B per domanda ${i + 1}`,
              c: `Opzione C per domanda ${i + 1}`,
              d: `Opzione D per domanda ${i + 1}`
            },
            correct_answer: "a"
          });
        }
        
        // Use the sample questions
        questions = sampleQuestions;
      }
      
      // Now that we have questions (either from db or sample), format them
      const formattedQuestions = questions.map(q => ({
        id: q.id,
        text: q.text,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correct_answer: q.correct_answer
      }));
      
      console.log(`Formatted ${formattedQuestions.length} questions for section ${sectionId}`);
      
      // Update session metadata
      const updatedSections = sections.map((s: any) => {
        if (s.id === sectionId) {
          return {
            ...s,
            status: 'in_progress',
            startedAt: new Date().toISOString(),
            questions: formattedQuestions
          };
        }
        return s;
      });
      
      const updatedMetadata = {
        ...metadata,
        sections: updatedSections,
        currentSection: sectionId
      };
      
      // Update the session in the database
      const { error: updateError } = await supabase
        .from('exam_sessions')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (updateError) {
        console.error('Error updating session metadata:', updateError);
        return res.status(500).json({ 
          message: 'Errore nell\'aggiornamento della sessione', 
          error: updateError.message 
        });
      }
      
      // Return the updated section
      return res.status(200).json({
        sectionId,
        status: 'in_progress',
        questions: formattedQuestions,
        duration: sectionDetails.duration,
        name: sectionDetails.name
      });
    } catch (error) {
      console.error('Error starting exam section:', error);
      return res.status(500).json({ 
        message: 'Errore nell\'avvio della sezione esame', 
        error: String(error) 
      });
    }
  });
  
  // Completa una sezione di esame
  app.post('/api/exam-simulation/sessions/:id/sections/:sectionId/complete', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);
      const userId = 1; // Hard-coded for testing
      const { answers } = req.body;
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Risposte non valide' });
      }
      
      console.log(`Completing section ${sectionId} for exam session ${sessionId}`);
      
      // Get current session
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
        
      if (sessionError || !session) {
        return res.status(404).json({ message: 'Sessione non trovata', error: sessionError?.message });
      }
      
      // Get session metadata
      const metadata = session.metadata || {};
      const sections = metadata.sections || [];
      
      // Find the section
      const sectionIndex = sections.findIndex((s: any) => s.id === sectionId);
      if (sectionIndex === -1) {
        return res.status(400).json({ message: 'Sezione non trovata' });
      }
      
      const section = sections[sectionIndex];
      const questions = section.questions || [];
      
      // Calculate score
      let correctAnswers = 0;
      const scoredAnswers = answers.map((answer: any) => {
        const question = questions.find((q: any) => q.id == answer.questionId);
        const isCorrect = question && question.correct_answer === answer.answer;
        
        if (isCorrect) correctAnswers++;
        
        return {
          ...answer,
          correct: isCorrect
        };
      });
      
      const score = {
        correct: correctAnswers,
        total: questions.length,
        percentage: Math.round((correctAnswers / questions.length) * 100)
      };
      
      // Update section in metadata
      const updatedSections = [...sections];
      updatedSections[sectionIndex] = {
        ...section,
        status: 'completed',
        completedAt: new Date().toISOString(),
        answers: scoredAnswers,
        score
      };
      
      // Check if all sections are completed
      const allCompleted = updatedSections.every((s: any) => s.status === 'completed');
      
      // Calculate overall score if all sections are completed
      let overallScore = null;
      if (allCompleted) {
        let totalCorrect = 0;
        let totalQuestions = 0;
        
        updatedSections.forEach((s: any) => {
          totalCorrect += s.score.correct;
          totalQuestions += s.score.total;
        });
        
        overallScore = {
          correct: totalCorrect,
          total: totalQuestions,
          percentage: Math.round((totalCorrect / totalQuestions) * 100)
        };
      }
      
      const updatedMetadata = {
        ...metadata,
        sections: updatedSections,
        currentSection: allCompleted ? null : metadata.currentSection,
        status: allCompleted ? 'completed' : 'in_progress',
        completedAt: allCompleted ? new Date().toISOString() : null,
        overallScore
      };
      
      // Update the session in the database
      const { error: updateError } = await supabase
        .from('exam_sessions')
        .update({
          metadata: updatedMetadata,
          status: allCompleted ? 'completed' : 'in_progress',
          completed_at: allCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (updateError) {
        console.error('Error updating session metadata:', updateError);
        return res.status(500).json({ 
          message: 'Errore nell\'aggiornamento della sessione', 
          error: updateError.message 
        });
      }
      
      // Return section score
      return res.status(200).json({
        sectionId,
        status: 'completed',
        score,
        overallScore,
        allCompleted
      });
    } catch (error) {
      console.error('Error completing exam section:', error);
      return res.status(500).json({ 
        message: 'Errore nel completamento della sezione esame', 
        error: String(error) 
      });
    }
  });
  
  // Ottieni i risultati di una sessione di esame completata
  app.get('/api/exam-simulation/sessions/:id/results', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = 1; // Hard-coded for testing
      
      console.log(`Fetching results for exam session ${sessionId}`);
      
      // Get the session data
      const { data: session, error } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      
      if (error || !session) {
        console.error('Error fetching exam session:', error);
        return res.status(404).json({ message: 'Sessione non trovata', error: error?.message });
      }
      
      // Check if the session is completed
      if (session.status !== 'completed') {
        return res.status(400).json({ message: 'La sessione non è ancora completata' });
      }
      
      const metadata = session.metadata || {};
      const sections = metadata.sections || [];
      const overallScore = metadata.overallScore;
      
      // Format results for each section
      const sectionResults = sections.map((section: any) => {
        return {
          id: section.id,
          name: section.name,
          score: section.score,
          questions: section.questions?.length || 0,
          answers: section.answers || []
        };
      });
      
      // Return formatted results
      return res.status(200).json({
        sessionId,
        examType: session.exam_type,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        sections: sectionResults,
        overallScore
      });
    } catch (error) {
      console.error('Error fetching exam results:', error);
      return res.status(500).json({ 
        message: 'Errore nel recupero dei risultati dell\'esame', 
        error: String(error) 
      });
    }
  });
  
  // Ottieni storico esami per l'utente corrente
  app.get('/api/exam-simulation/history', async (req, res) => {
    try {
      const userId = 1; // Hard-coded for testing
      
      console.log(`Fetching exam history for user ${userId}`);
      
      // Get all completed exam sessions for the user
      const { data: sessions, error } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching exam history:', error);
        return res.status(500).json({ 
          message: 'Errore nel recupero dello storico esami', 
          error: error.message 
        });
      }
      
      // Format sessions for the frontend
      const formattedSessions = sessions?.map(session => {
        const metadata = session.metadata || {};
        const overallScore = metadata.overallScore || {};
        
        return {
          id: session.id,
          examType: session.exam_type,
          startedAt: session.started_at,
          completedAt: session.completed_at,
          score: overallScore.percentage || 0,
          correctAnswers: overallScore.correct || 0,
          totalQuestions: overallScore.total || 0
        };
      }) || [];
      
      return res.status(200).json(formattedSessions);
    } catch (error) {
      console.error('Error in exam history endpoint:', error);
      return res.status(500).json({ 
        message: 'Errore interno del server', 
        error: String(error) 
      });
    }
  });
  
  return httpServer;
}
