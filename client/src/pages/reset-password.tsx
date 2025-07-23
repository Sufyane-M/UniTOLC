import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Password schema
const passwordResetSchema = z.object({
  password: z.string()
    .min(8, { message: "La password deve avere almeno 8 caratteri" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero"
    }),
  confirmPassword: z.string()
    .min(1, { message: "La conferma della password è obbligatoria" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

const ResetPassword = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { updatePassword, supabase, isLoading } = useAuth();

  // Form to reset password
  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check if we have a hash, if not redirect to home
  useEffect(() => {
    const handleHashChange = async () => {
      setLoading(true);
      setError(null);
      
      // Check if the hash matches the pattern for a password reset
      const isPasswordResetHash = window.location.hash && 
        (window.location.hash.includes('type=recovery') || 
         window.location.hash.includes('type=signup'));
      
      if (!isPasswordResetHash) {
        setLocation('/');
        return;
      }
      
      try {
        // Check if we have a valid auth session from the recovery link
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError("Link non valido o scaduto. Richiedi un nuovo link di reset.");
          setLoading(false);
          return;
        }
        
        if (!session) {
          // Try to handle the recovery link
          const { data, error: signInError } = await supabase.auth.refreshSession();
          
          if (signInError || !data.session) {
            console.error('Error refreshing session:', signInError);
            setError("Link non valido o scaduto. Richiedi un nuovo link di reset.");
            setLoading(false);
            return;
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError("Si è verificato un errore. Riprova.");
        setLoading(false);
      }
    };
    
    handleHashChange();
  }, [supabase, setLocation]);

  const handleSubmit = async (data: PasswordResetFormValues) => {
    setError(null);
    
    try {
      const success = await updatePassword(data.password);
      
      if (success) {
        setSuccess("Password aggiornata con successo!");
        setTimeout(() => {
          setLocation('/');
        }, 3000);
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError("Si è verificato un errore nell'aggiornamento della password. Riprova.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Reimposta la tua password</CardTitle>
          <CardDescription>
            Inserisci la tua nuova password
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuova Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="Inserisci la nuova password" 
                          {...field} 
                          type={showPassword ? "text" : "password"} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={togglePasswordVisibility}
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conferma Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="Conferma la nuova password" 
                          {...field} 
                          type={showPassword ? "text" : "password"} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={togglePasswordVisibility}
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aggiornamento in corso...
                  </>
                ) : "Aggiorna Password"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            onClick={() => setLocation('/')}
          >
            Torna alla Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword; 