import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool for PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Export a function for running queries
export async function query(text: string, params: any[] = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (over 200ms) for performance monitoring
    if (duration > 200) {
      console.log('Slow query:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // process.exit(-1); // Avoid crashing the server on pool errors
});

// Event listeners for connection pool monitoring
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Database connection established');
  }
});

// When the process exits, close the pool
process.on('exit', () => {
  pool.end();
});