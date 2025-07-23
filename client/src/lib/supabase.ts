import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Define a version identifier for the storage key
// Increment this if there are breaking changes in session format
const STORAGE_VERSION = 'v1';
const STORAGE_KEY = `supabase-auth-${STORAGE_VERSION}`;

// Helper to check if a session might be expired or invalid
const isSessionExpired = (sessionStr: string): boolean => {
  try {
    const session = JSON.parse(sessionStr);
    if (!session || !session.expires_at) {
      console.warn('Session data is missing expiration information');
      return true;
    }
    
    // Handle both timestamp formats (seconds and milliseconds)
    let expiryTime: number;
    if (typeof session.expires_at === 'number') {
      // If it's a number, check if it's in seconds (Unix timestamp) or milliseconds
      expiryTime = session.expires_at < 10000000000 ? session.expires_at * 1000 : session.expires_at;
    } else {
      // If it's a string, parse it as ISO date
      expiryTime = new Date(session.expires_at).getTime();
    }
    
    const now = new Date().getTime();
    
    // Check if the timestamp is valid (not in 1970)
    if (expiryTime < 946684800000) { // January 1, 2000
      console.warn('Session has invalid expiration timestamp, treating as expired');
      return true;
    }
    
    // Only consider session expired if it's been expired for more than 15 minutes
    // Since Supabase can refresh tokens automatically, give it more time
    const bufferTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (now > expiryTime + bufferTime) {
      console.log('Session expired at', new Date(expiryTime).toISOString(), 'current time is', new Date(now).toISOString());
      return true;
    }
    
    // Check if session has a valid refresh token
    // If there's a refresh token, the session can be refreshed
    if (session.refresh_token) {
      return false; // Not expired if we have a refresh token
    }
    
    // Check if session data is corrupted or incomplete
    if (!session.access_token || !session.user) {
      console.warn('Session data is incomplete - missing tokens or user data');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error parsing session JSON:', error);
    return true;
  }
};

// Clear all Supabase related items from localStorage
const clearAllSupabaseSessions = () => {
  try {
    // Clear all known Supabase auth keys that might be present
    localStorage.removeItem('supabase-auth');
    localStorage.removeItem(`supabase-auth-${STORAGE_VERSION}`);
    localStorage.removeItem('supabase.auth.token');
    
    // Only log this in development to avoid console spam
    if (import.meta.env.DEV) {
      console.log('Cleared all Supabase session data from localStorage');
    }
  } catch (error) {
    console.error('Error clearing Supabase sessions:', error);
  }
};

// Custom storage implementation that validates sessions
const customStorage = {
  getItem: (key: string) => {
    if (key !== STORAGE_KEY) {
      return localStorage.getItem(key);
    }
    
    const sessionStr = localStorage.getItem(key);
    if (!sessionStr) {
      return null;
    }
    
    // Check if session is expired or invalid
    if (isSessionExpired(sessionStr)) {
      console.log('Removing expired session from storage');
      localStorage.removeItem(key);
      // Also clear any related auth data
      localStorage.removeItem('supabase.auth.token');
      return null;
    }
    
    return sessionStr;
  },
  setItem: (key: string, value: string) => {
    // Validate session data before storing
    if (key === STORAGE_KEY) {
      try {
        const session = JSON.parse(value);
        if (!session || !session.access_token || !session.user) {
          console.warn('Attempting to store invalid session data');
          return;
        }
      } catch (error) {
        console.error('Invalid session data format:', error);
        return;
      }
    }
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};

// Create a single Supabase client instance to be reused throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: STORAGE_KEY,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: customStorage,
  },
  realtime: {
    // We can add params here if needed, for now, just making it explicit
  }
}); 

// Export the utility function for clearing sessions
export { clearAllSupabaseSessions };