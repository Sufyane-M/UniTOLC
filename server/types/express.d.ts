import { User } from '../../shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    impersonation?: {
      originalUserId: number;
      targetUserId: number;
      sessionId: string;
      adminId: number;
    };
  }
}