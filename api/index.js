import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { supabase } from '../server/db/index.js';
import session from 'express-session';
import MemoryStore from 'memorystore';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure Express session for serverless
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'tolcprep-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true, // Always secure in production
    sameSite: 'lax'
  }
}));

// Supabase health check
app.get('/api/health/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.log('Supabase health check failed:', error.message);
      return res.status(500).json({ status: 'error', message: 'Supabase connection failed', error: error.message });
    }
    return res.status(200).json({ status: 'ok', message: 'Supabase connected successfully' });
  } catch (err) {
    console.log('Supabase health check exception:', String(err));
    return res.status(500).json({ status: 'error', message: 'Supabase connection failed', error: String(err) });
  }
});

// Register API routes
await registerRoutes(app);

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.log(`Error ${status}: ${message}`);
  res.status(status).json({ message });
});

export default app;