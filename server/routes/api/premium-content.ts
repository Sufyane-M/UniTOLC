import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Middleware to check if user is authenticated and premium
const isPremiumUser = async (req: Request, res: Response, next: Function) => {
  try {
    // For testing, hardcode to allow all requests
    // In a real app, you would check the authenticated user's premium status
    // This is just for demo purposes
    
    // Always proceed for now (demo mode)
    next();
  } catch (error) {
    console.error('Error checking premium status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/premium-content/section-details/:sessionId/:sectionId
 * Get detailed section results with questions, answers and explanations for premium users
 */
router.get('/section-details/:sessionId/:sectionId', isPremiumUser, async (req: Request, res: Response) => {
  try {
    const { sessionId, sectionId } = req.params;
    
    // Use a hardcoded user ID for testing
    const userId = 1;

    // For demonstration, always return mock questions
    // Create mock questions for testing
    const mockQuestions = [
      {
        id: "1",
        text: "Quanto fa 2+2?",
        options: { a: "3", b: "4", c: "5", d: "6" },
        correct_answer: "b",
        explanation: "La somma di 2 e 2 è 4",
        userAnswer: "a", // Mock data
        isCorrect: false // Mock data
      },
      {
        id: "2",
        text: "Calcola la derivata di f(x) = x²",
        options: { a: "f'(x) = x", b: "f'(x) = 2x", c: "f'(x) = 2", d: "f'(x) = x²" },
        correct_answer: "b",
        explanation: "La derivata di x² è 2x",
        userAnswer: "b", // Mock data
        isCorrect: true // Mock data
      },
      {
        id: "3",
        text: "Quale delle seguenti equazioni rappresenta una retta?",
        options: { a: "y = x²", b: "y = sin(x)", c: "y = 2x + 3", d: "y = 1/x" },
        correct_answer: "c",
        explanation: "L'equazione y = mx + q rappresenta una retta, dove m è il coefficiente angolare e q è l'intercetta.",
        userAnswer: "c", // Mock data
        isCorrect: true // Mock data
      }
    ];

    // Log for debugging
    console.log(`Processing demo questions for premium user, section ${sectionId}`);

    // Return demo detailed results
    const detailedResults = {
      sectionId: parseInt(sectionId),
      sectionName: "Sezione Demo",
      questions: mockQuestions,
      score: {
        correct: 2,
        total: 3,
        percentage: 67
      }
    };

    // Log what we're sending back
    console.log("Sending premium content response:", JSON.stringify(detailedResults, null, 2).substring(0, 200) + "...");

    res.json(detailedResults);
  } catch (error) {
    console.error('Error fetching premium content:', error);
    res.status(500).json({ message: 'Failed to fetch premium content' });
  }
});

export default router; 