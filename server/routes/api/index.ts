import { Router } from 'express';
import premiumContent from './premium-content';
import { adminRouter } from './admin';
import authRouter from './auth';
import examsRouter from './exams';

const router = Router();

// Mount the API routes
router.use('/premium-content', premiumContent);
router.use('/admin', adminRouter);
router.use('/auth', authRouter);
router.use('/exams', examsRouter);

export default router;