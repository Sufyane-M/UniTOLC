import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: "user" | "admin";
  isPremium: boolean;
  profileImage?: string;
  xpPoints?: number;
  lastActive?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  supabase: SupabaseClient;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Use a ref to track session checks across renders
  const initialSessionCheckedRef = useRef(false);
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const userChangesSubscriptionRef = useRef<any>(null);
  const timeoutRef = useRef<number | null>(null);

  // Create a new user in our database after auth registration
  const createUserRecord = async (
    authUserId: string, 
    email: string, 
    username: string, 
    fullName?: string
  ): Promise<number | null> => {
    try {
      console.log('Creating user record for:', { authUserId, email, username, fullName });
      

      
      // Check if user with this email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        console.log('User with this email already exists, using existing user:', existingUser.id);
        // Create auth mapping for existing user
        const { error: mappingError } = await supabase
          .from('auth_user_mapping')
          .insert({ auth_user_id: authUserId, user_id: existingUser.id });
        
        if (mappingError) {
          console.error('Error creating auth mapping for existing user:', mappingError);
          return null;
        }
        return existingUser.id;
      }
      
      // Generate unique username if needed
      let finalUsername = username;
      let attempts = 0;
      while (attempts < 5) {
        const { data: usernameCheck } = await supabase
          .from('users')
          .select('id')
          .eq('username', finalUsername)
          .maybeSingle();
        
        if (!usernameCheck) break;
        
        attempts++;
        finalUsername = `${username}_${Math.random().toString(36).substring(2, 6)}`;
      }
      
      // Create the user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          username: finalUsername,
          full_name: fullName,
          role: 'user',
          is_premium: false,
          xp_points: 0,
          last_active: new Date().toISOString(),
          onboarding_completed: false
        })
        .select('id')
        .single();

      if (userError || !userData) {
        console.error('Error creating user record:', userError);
        return null;
      }

      // Then create auth mapping
      const { error: mappingError } = await supabase
        .from('auth_user_mapping')
        .insert({
          auth_user_id: authUserId,
          user_id: userData.id
        });

      if (mappingError) {
        console.error('Error creating auth mapping:', mappingError);
        // Try to clean up the user record since the mapping failed
        await supabase.from('users').delete().eq('id', userData.id);
        return null;
      }

      return userData.id;
    } catch (error) {
      console.error('Error in createUserRecord:', error);
      return null;
    }
  };

  // Update user stats from realtime subscription
  const handleUserStatsUpdate = useCallback((payload: any) => {
    if (payload.new) {
      // Update user state with new data
      setUser(prevUser => {
        if (!prevUser || prevUser.id !== payload.new.id) return prevUser;
        return {
          ...prevUser,
          xpPoints: payload.new.xp_points,
          lastActive: payload.new.last_active,
          isPremium: payload.new.is_premium
        };
      });
    }
  }, []);

  // Handle post-login flow
  const handleLoginSuccess = async (authUserId: string, email: string): Promise<boolean> => {
    // Fetch the user profile directly
    let userProfile = await fetchUserProfile(authUserId);

    // If no profile exists, try to create one
    if (!userProfile) {
      console.log('No user profile found, attempting to create one...');

      // Get user details from Auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('Cannot get authenticated user details');
        return false;
      }

      // Extract metadata to use for profile creation
      const metadata = user.user_metadata || {};
      const username = metadata.username || `user_${Math.random().toString(36).substring(2, 8)}`;
      const fullName = metadata.full_name;

      // Create a new user record
      const newUserId = await createUserRecord(
        authUserId,
        email,
        username,
        fullName
      );

      if (newUserId) {
        console.log('Created new user profile with ID:', newUserId);
        // Re-fetch the profile
        userProfile = await fetchUserProfile(authUserId);
      }
    }

    if (userProfile) {
      console.log('Login successful, user profile loaded:', userProfile.id);
      setUser(userProfile);
      initialSessionCheckedRef.current = true;
      return true;
    } else {
      console.error('Login successful but failed to load or create user profile');
      return false;
    }
  };

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (authUserId: string): Promise<User | null> => {
    try {
      // First check if the user exists in auth_user_mapping
      const { data: mappingData, error: mappingError } = await supabase
        .from('auth_user_mapping')
        .select('user_id')
        .eq('auth_user_id', authUserId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors
      
      if (mappingError) {
        return null;
      }
      
      // If mapping doesn't exist, we need to create a user
      if (!mappingData) {
        // Get user details from Auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return null;
        }
        
        // Extract metadata 
        const metadata = user.user_metadata || {};
        const email = user.email || '';
        const username = metadata.username || `user_${Math.random().toString(36).substring(2, 8)}`;
        const fullName = metadata.full_name;
        
        // Create a new user record
        const newUserId = await createUserRecord(authUserId, email, username, fullName);
        if (!newUserId) {
          return null;
        }
        
        // Now fetch the newly created user
        const { data: newUserData, error: newUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', newUserId)
          .single();
        
        if (newUserError || !newUserData) {
          return null;
        }
        
        return {
          id: newUserData.id,
          username: newUserData.username,
          email: newUserData.email,
          fullName: newUserData.full_name,
          role: newUserData.role,
          isPremium: newUserData.is_premium,
          profileImage: newUserData.profile_image,
          xpPoints: newUserData.xp_points,
          lastActive: newUserData.last_active
        };
      }
      
      // We have a mapping, so fetch the user
      const { data: userData, error: userError } = await supabase
            .from('users')
        .select('*')
        .eq('id', mappingData.user_id)
            .single();
          
      if (userError || !userData) {
        return null;
      }
      
            // Transform database column names to match our interface
      return {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              fullName: userData.full_name,
              role: userData.role,
              isPremium: userData.is_premium,
              profileImage: userData.profile_image,
              xpPoints: userData.xp_points,
              lastActive: userData.last_active
      };
    } catch (error) {
      return null;
          }
  }, []);

  // Clean up any pending timers
  const cleanupTimers = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Reset auth state when there's an issue
  const resetAuthState = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setUser(null);
    setSupabaseUser(null);
    setIsLoading(false);
  }, []);

  // Setup Supabase auth listener and realtime subscriptions
  useEffect(() => {
    console.log('Setting up auth listener, isLoading:', isLoading);
    
    setIsLoading(true);
    
    // Set a timeout to prevent infinite loading
    timeoutRef.current = window.setTimeout(() => {
      console.log('Auth loading timed out after 10 seconds');
      resetAuthState();
    }, 10000);
    
    // Subscribe to auth changes
    const setupAuthSubscription = () => {
      // Clean up any existing subscription first
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
      
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Supabase auth event:', event);
        
        // Clear the timeout whenever we get an auth event
        cleanupTimers();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          // Fetch the user profile
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
            initialSessionCheckedRef.current = true;
            setIsLoading(false);
            
            // Setup realtime subscription for this user
            setupRealtimeSubscription(userProfile.id);
          } else if (event === 'SIGNED_IN') {
            // This could be a new user that just registered and confirmed their email
            const userMetadata = session.user.user_metadata;
            const username = userMetadata.username || 'user' + Math.random().toString(36).substring(2, 8);
            const fullName = userMetadata.full_name;
            
            const userId = await createUserRecord(
              session.user.id, 
              session.user.email || '', 
              username, 
              fullName
            );
            
            if (userId) {
              // Re-fetch the user profile
              const newUserProfile = await fetchUserProfile(session.user.id);
              if (newUserProfile) {
                setUser(newUserProfile);
                setupRealtimeSubscription(newUserProfile.id);
              }
            }
            
            initialSessionCheckedRef.current = true;
            setIsLoading(false);
          } else {
            // We couldn't find a user profile and it's not a new registration
            // Force refresh the session or clear it
            try {
              await supabase.auth.refreshSession();
              // If refreshing doesn't work, we'll just clear the state
              resetAuthState();
            } catch (error) {
              console.error('Error refreshing session:', error);
              resetAuthState();
            }
        }
      } else {
        // User is not authenticated
        setSupabaseUser(null);
        setUser(null);
          initialSessionCheckedRef.current = true;
          setIsLoading(false);
          
          // Clean up realtime subscription
          if (userChangesSubscriptionRef.current) {
            userChangesSubscriptionRef.current.unsubscribe();
            userChangesSubscriptionRef.current = null;
          }
        }
      });
      
      authSubscriptionRef.current = data.subscription;
    };
    
    // Setup realtime subscription to user updates
    const setupRealtimeSubscription = (userId: number) => {
      // Clean up any existing subscription
      if (userChangesSubscriptionRef.current) {
        userChangesSubscriptionRef.current.unsubscribe();
        userChangesSubscriptionRef.current = null;
      }
      
      if (userId) {
        const subscription = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${userId}`
            },
            handleUserStatsUpdate
          )
          .subscribe();
        
        userChangesSubscriptionRef.current = subscription;
        return subscription;
      }
      return null;
    };
    
    // Check current session on initial load
    const checkCurrentSession = async () => {
      if (initialSessionCheckedRef.current) {
        console.log('Session already checked, skipping');
        cleanupTimers();
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Checking current session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          resetAuthState();
          return;
        }
        
        let { session } = data;
        
        if (!session) {
          console.log('No active session found');
          
          // Attempt to refresh the session before giving up
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session) {
              console.log('No session after refresh attempt');
              resetAuthState();
              return;
            }
            
            console.log('Session refreshed successfully');
            // Continue with the refreshed session
            session = refreshData.session;
          } catch (refreshErr) {
            console.error('Error refreshing session:', refreshErr);
            resetAuthState();
            return;
          }
        }
        
        console.log('Session found, user ID:', session.user.id);
        
        // Set up auth subscription first
        setupAuthSubscription();
        
        // Explicitly set the supabase user
        setSupabaseUser(session.user);
        
        // Fetch user profile
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          console.log('User profile loaded:', userProfile.id);
          setUser(userProfile);
          setupRealtimeSubscription(userProfile.id);
          initialSessionCheckedRef.current = true;
          cleanupTimers();
          setIsLoading(false);
        } else {
          console.error('Could not load user profile for authenticated user');
          // We'll try to refresh the session as a last resort
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session) {
            // Try fetching the profile again with the refreshed session
            const refreshedProfile = await fetchUserProfile(refreshData.session.user.id);
            if (refreshedProfile) {
              setUser(refreshedProfile);
              setupRealtimeSubscription(refreshedProfile.id);
              initialSessionCheckedRef.current = true;
              cleanupTimers();
              setIsLoading(false);
              return;
            }
          }
          
          // If that doesn't work, the auth state change will handle it
          // Set a shorter timeout just in case
          timeoutRef.current = window.setTimeout(() => {
            resetAuthState();
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking current session:', error);
        resetAuthState();
      }
    };
    
    // Start the auth flow
    checkCurrentSession();
    
    // Cleanup function for component unmount
    return () => {
      cleanupTimers();
      
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
      
      if (userChangesSubscriptionRef.current) {
        userChangesSubscriptionRef.current.unsubscribe();
        userChangesSubscriptionRef.current = null;
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Clear existing session data before login to avoid conflicts
      await supabase.auth.signOut();

      // Clear local state
      setUser(null);
      setSupabaseUser(null);
      initialSessionCheckedRef.current = false;

      console.log('Attempting login for:', email);

      // Login with retry logic for rate limiting
      let loginAttempts = 0;
      const maxRetries = 3;
      let data, error;

      while (loginAttempts < maxRetries) {
        const result = await supabase.auth.signInWithPassword({
          email,
          password
        });

        data = result.data;
        error = result.error;

        // If no error or error is not rate limiting, break the loop
        if (!error || !error.message.includes('For security purposes')) {
          break;
        }

        loginAttempts++;

        // If it's a rate limiting error and we haven't exceeded max retries
        if (loginAttempts < maxRetries) {
          // Extract wait time from error message or use default
          const waitTimeMatch = error.message.match(/(\d+)\s*seconds?/);
          const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 30;

          toast({
            title: "Limite di richieste raggiunto",
            description: `Attendere ${waitTime} secondi prima di riprovare... (Tentativo ${loginAttempts}/${maxRetries})`,
            variant: "destructive",
          });

          // Wait for the specified time plus a small buffer
          await new Promise(resolve => setTimeout(resolve, (waitTime + 2) * 1000));
        }
      }

      if (error) {
        console.error('Login error:', error.message);

        // Provide user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('For security purposes')) {
          errorMessage = "Troppe richieste di accesso. Riprova tra qualche minuto.";
        } else if (error.message === "Invalid login credentials") {
          errorMessage = "Credenziali non valide. Controlla email e password.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Email non confermata. Controlla la tua casella di posta.";
        }

        toast({
          title: "Errore di accesso",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      if (!data.session || !data.user) {
        console.error('Login failed: No session or user returned');
        toast({
          title: "Errore di accesso",
          description: "Impossibile avviare la sessione. Riprova più tardi.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      // Manually set the session for the client to enforce RLS
      await supabase.auth.setSession(data.session);
      setSupabaseUser(data.user);

      console.log('Login successful, handling post-login flow...');
      const loginSuccess = await handleLoginSuccess(data.user.id, email);

      if (loginSuccess) {
        toast({
          title: "Accesso effettuato",
          description: "Hai effettuato l'accesso con successo.",
        });
        setIsLoading(false);
        return true;
      } else {
        // Clean up the failed login attempt
        await supabase.auth.signOut();
        setSupabaseUser(null);
        setUser(null);

        toast({
          title: "Errore di profilo",
          description: "Accesso effettuato, ma impossibile caricare o creare il profilo utente.",
          variant: "destructive",
        });

        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);

      // Clean up any partial state
      setSupabaseUser(null);
      setUser(null);

      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'accesso.",
        variant: "destructive",
      });

      setIsLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if username is already taken
      const { data: existingUsers, error: usernameCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('username', userData.username)
        .limit(1);
      
      if (usernameCheckError) {
        console.error('Error checking username:', usernameCheckError);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la verifica dell'username.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Username non disponibile",
          description: "Questo username è già in uso. Scegline un altro.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      // Register with Supabase Auth with retry logic for rate limiting
      let signUpAttempts = 0;
      const maxRetries = 3;
      let data, error;
      
      while (signUpAttempts < maxRetries) {
        const result = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              username: userData.username,
              full_name: userData.fullName
            }
          }
        });
        
        data = result.data;
        error = result.error;
        
        // If no error or error is not rate limiting, break the loop
        if (!error || !error.message.includes('For security purposes')) {
          break;
        }
        
        signUpAttempts++;
        
        // If it's a rate limiting error and we haven't exceeded max retries
        if (signUpAttempts < maxRetries) {
          // Extract wait time from error message or use default
          const waitTimeMatch = error.message.match(/(\d+)\s*seconds?/);
          const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 30;
          
          toast({
            title: "Limite di richieste raggiunto",
            description: `Attendere ${waitTime} secondi prima di riprovare... (Tentativo ${signUpAttempts}/${maxRetries})`,
            variant: "destructive",
          });
          
          // Wait for the specified time plus a small buffer
          await new Promise(resolve => setTimeout(resolve, (waitTime + 2) * 1000));
        }
      }
      
      if (error) {
        console.error('Registration error:', error.message);
        
        // Provide user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('For security purposes')) {
          errorMessage = "Troppe richieste di registrazione. Riprova tra qualche minuto.";
        } else if (error.message.includes('User already registered')) {
          errorMessage = "Un account con questa email esiste già.";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "La password deve essere di almeno 6 caratteri.";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Formato email non valido.";
        }
        
        toast({
          title: "Errore di registrazione",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      // Create user in our database
      if (data.user && data.session) {
        // Set the session for the current client to ensure RLS is enforced correctly
        await supabase.auth.setSession(data.session);

        const userId = await createUserRecord(
          data.user.id,
          userData.email,
          userData.username,
          userData.fullName
        );
        
        if (!userId) {
          toast({
            title: "Errore di registrazione",
            description: "Si è verificato un errore durante la creazione del profilo utente.",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
      }
      
      toast({
        title: "Registrazione completata",
        description: data.session 
          ? "Account creato con successo. Hai effettuato l'accesso."
          : "Controlla la tua email per confermare la registrazione.",
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Reset password with retry logic for rate limiting
      let resetAttempts = 0;
      const maxRetries = 3;
      let error;
      
      while (resetAttempts < maxRetries) {
        const result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        error = result.error;
        
        // If no error or error is not rate limiting, break the loop
        if (!error || !error.message.includes('For security purposes')) {
          break;
        }
        
        resetAttempts++;
        
        // If it's a rate limiting error and we haven't exceeded max retries
        if (resetAttempts < maxRetries) {
          // Extract wait time from error message or use default
          const waitTimeMatch = error.message.match(/(\d+)\s*seconds?/);
          const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 30;
          
          toast({
            title: "Limite di richieste raggiunto",
            description: `Attendere ${waitTime} secondi prima di riprovare... (Tentativo ${resetAttempts}/${maxRetries})`,
            variant: "destructive",
          });
          
          // Wait for the specified time plus a small buffer
          await new Promise(resolve => setTimeout(resolve, (waitTime + 2) * 1000));
        }
      }
      
      if (error) {
        console.error('Password reset error:', error.message);
        
        // Provide user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('For security purposes')) {
          errorMessage = "Troppe richieste di reset password. Riprova tra qualche minuto.";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Formato email non valido.";
        } else if (error.message.includes('User not found')) {
          errorMessage = "Nessun account trovato con questa email.";
        }
        
        toast({
          title: "Errore",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      toast({
        title: "Email inviata",
        description: "Ti abbiamo inviato un'email con le istruzioni per reimpostare la password.",
      });
      
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio dell'email di reset.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function (when authenticated)
  const updatePassword = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Update password error:', error.message);
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Password aggiornata",
        description: "La tua password è stata aggiornata con successo.",
      });
      
      return true;
    } catch (error) {
      console.error("Update password error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento della password.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clean up subscriptions first
      if (userChangesSubscriptionRef.current) {
        userChangesSubscriptionRef.current.unsubscribe();
        userChangesSubscriptionRef.current = null;
      }
      
      // Force clear the user state first (for UI purposes)
      setUser(null);
      setSupabaseUser(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error.message);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il logout.",
          variant: "destructive",
        });
      } else {
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo.",
      });
      }
      
      // Reset the session check flag
      initialSessionCheckedRef.current = false;
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        updatePassword,
        supabase
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
