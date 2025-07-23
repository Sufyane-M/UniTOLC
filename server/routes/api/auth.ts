import { Router } from 'express';
import passport from 'passport';
import { storage } from '../../storage';
import { insertUserSchema, loginUserSchema } from '@shared/schema';

const router = Router();

// Registrazione
router.post('/register', async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);

    // Controlla se l'utente esiste già
    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email già registrata' });
    }

    const existingUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username già in uso' });
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
router.post('/login', (req, res, next) => {
  try {
    loginUserSchema.parse(req.body);

    passport.authenticate('local', (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Credenziali non valide' });
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
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: 'Logout effettuato con successo' });
  });
});

// Ottieni utente corrente
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Non autenticato' });
  }

  // Rimuovi la password dall'oggetto utente
  const { password, ...userWithoutPassword } = req.user as any;

  res.status(200).json(userWithoutPassword);
});

export default router;