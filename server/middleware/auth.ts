import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to verify user authentication
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get JWT from request header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Get user role from database via auth_user_mapping
    const { data: userData, error: userError } = await supabase
      .from('auth_user_mapping')
      .select(`
        user_id,
        users!inner(
          id,
          email,
          role
        )
      `)
      .eq('auth_user_id', data.user.id)
      .single();
    
    if (userError || !userData) {
      return res.status(401).json({ message: 'User not found in database' });
    }
    
    // Add user data to request
    req.user = {
      id: userData.user_id, // Use the mapped integer user_id from database
      email: userData.users.email,
      role: userData.users.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};