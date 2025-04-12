import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { WebSocketServer, WebSocket } from "ws";
import { insertUserSchema, loginUserSchema, insertUserExamSchema, insertQuizSchema } from "@shared/schema";
import { format, parseISO, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";

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

  // Middleware per verificare autenticazione
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Non autorizzato" });
  };

  // Middleware per verificare ruolo admin
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: "Accesso negato" });
  };

  // ----------------------
  // Routes di autenticazione
  // ----------------------
  
  // Registrazione
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Controlla se l'utente esiste già
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email già registrata" });
      }
      
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username già in uso" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Rimuovi la password dall'oggetto utente prima di inviarlo al client
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Login
  app.post('/api/auth/login', (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      passport.authenticate('local', (err: Error, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Credenziali non valide" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Aggiorna lastActive
          storage.updateUser(user.id, { lastActive: new Date() });
          
          // Rimuovi la password dall'oggetto utente
          const { password, ...userWithoutPassword } = user;
          
          return res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logout effettuato con successo" });
    });
  });

  // Ottieni utente corrente
  app.get('/api/auth/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    // Rimuovi la password dall'oggetto utente
    const { password, ...userWithoutPassword } = req.user as any;
    
    res.status(200).json(userWithoutPassword);
  });

  // ----------------------
  // Routes per gli esami
  // ----------------------
  
  // Registra un nuovo esame
  app.post('/api/exams', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUserExamSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      const exam = await storage.createUserExam(userId, validatedData);
      res.status(201).json(exam);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Ottieni l'esame dell'utente
  app.get('/api/exams', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const exam = await storage.getUserExam(userId);
      
      if (!exam) {
        return res.status(404).json({ message: "Nessun esame trovato" });
      }
      
      // Calcola giorni rimanenti
      let daysRemaining = null;
      if (exam.examDate) {
        const examDate = new Date(exam.examDate);
        const today = new Date();
        daysRemaining = differenceInDays(examDate, today);
      }
      
      res.status(200).json({
        ...exam,
        daysRemaining
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

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
  app.get('/api/weak-areas', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const weakAreas = await storage.getWeakAreas(userId);
      
      res.status(200).json(weakAreas);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni raccomandazioni di studio
  app.get('/api/study-recommendations', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const recommendations = await storage.getStudyRecommendations(userId);
      
      res.status(200).json(recommendations);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Ottieni sfide giornaliere
  app.get('/api/daily-challenges', isAuthenticated, async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const challenges = await storage.getDailyChallenges(today);
      const userId = (req.user as any).id;
      
      // Ottieni le sfide completate dall'utente
      const completedChallenges = await storage.getUserCompletedChallenges(userId, today);
      const completedIds = completedChallenges.map(c => c.challengeId);
      
      // Aggiungi il campo 'completed' a ciascuna sfida
      const challengesWithStatus = challenges.map(challenge => ({
        ...challenge,
        completed: completedIds.includes(challenge.id)
      }));
      
      res.status(200).json(challengesWithStatus);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Completa una sfida giornaliera
  app.post('/api/daily-challenges/:id/complete', isAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Controlla se la sfida è già stata completata
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedChallenges = await storage.getUserCompletedChallenges(userId, today);
      if (completedChallenges.some(c => c.challengeId === challengeId)) {
        return res.status(400).json({ message: "Sfida già completata" });
      }
      
      const completion = await storage.completeChallenge(userId, challengeId);
      
      res.status(200).json(completion);
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
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Rimuovi le password
      const usersWithoutPasswords = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Promuovi un utente ad admin
  app.post('/api/admin/users/:id/promote', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.promoteToAdmin(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // Rimuovi la password
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Create a map to track connections by user ID
  const userConnections = new Map<number, WebSocket[]>();
  
  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication message to link connection to user
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          
          // Add this connection to the user's connections
          if (!userConnections.has(userId)) {
            userConnections.set(userId, []);
          }
          userConnections.get(userId)?.push(ws);
          
          // Send initial data to the client
          ws.send(JSON.stringify({
            type: 'connection_established',
            message: 'Successfully connected for real-time updates'
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle disconnect
    ws.on('close', () => {
      if (userId) {
        // Remove this connection from the user's connections
        const connections = userConnections.get(userId);
        if (connections) {
          const index = connections.indexOf(ws);
          if (index !== -1) {
            connections.splice(index, 1);
          }
          
          // If no more connections for this user, remove the user entry
          if (connections.length === 0) {
            userConnections.delete(userId);
          }
        }
      }
    });
  });
  
  // Export the function to send updates to users in real-time
  (global as any).sendUserUpdate = (userId: number, data: any) => {
    const connections = userConnections.get(userId);
    if (connections && connections.length > 0) {
      const message = JSON.stringify({
        type: 'user_update',
        data
      });
      
      connections.forEach(conn => {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(message);
        }
      });
    }
  };
  
  return httpServer;
}
