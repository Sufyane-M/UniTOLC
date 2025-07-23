import { Router } from 'express';
import { storage } from '../../storage';
import { insertUserExamSchema } from '@shared/schema';
import { differenceInDays } from 'date-fns';
import { isAuthenticated as jwtAuth } from '../../middleware/auth';

const router = Router();

// Registra un nuovo esame
router.post('/', jwtAuth, async (req, res) => {
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
router.get('/', jwtAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const exam = await storage.getUserExam(userId);

    if (!exam) {
      return res.status(404).json({ message: 'Nessun esame trovato' });
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

export default router;