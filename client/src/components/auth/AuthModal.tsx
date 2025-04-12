import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Schema di validazione login
const loginSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida" }),
  password: z.string().min(1, { message: "La password è obbligatoria" }),
});

// Schema di validazione registrazione
const registerSchema = z.object({
  username: z.string().min(3, { message: "Username deve avere almeno 3 caratteri" }),
  email: z.string().email({ message: "Inserisci un'email valida" }),
  password: z.string().min(8, { message: "La password deve avere almeno 8 caratteri" }),
  fullName: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, initialMode }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  // Form login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form registrazione
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast({
          title: "Login effettuato",
          description: "Hai effettuato l'accesso con successo.",
          variant: "default",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Email o password non validi. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const success = await register(data);
      if (success) {
        toast({
          title: "Registrazione completata",
          description: "Il tuo account è stato creato con successo.",
          variant: "default",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl mb-2">
            {mode === "login" ? "Accedi a TolcPrep" : "Registrati a TolcPrep"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "login" 
              ? "Inserisci le tue credenziali per accedere alla piattaforma"
              : "Crea un nuovo account per iniziare la tua preparazione"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Accedi</TabsTrigger>
            <TabsTrigger value="register">Registrati</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="La tua email" 
                          {...field} 
                          type="email" 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="La tua password" 
                          {...field} 
                          type="password" 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Accesso in corso..." : "Accedi"}
                </Button>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <a href="#" className="hover:text-primary">Password dimenticata?</a>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Il tuo username" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="La tua email" 
                          {...field} 
                          type="email"
                          disabled={loading} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Crea una password" 
                          {...field} 
                          type="password"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo (opzionale)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Il tuo nome e cognome" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Registrazione in corso..." : "Registrati"}
                </Button>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Registrandoti, accetti i nostri{" "}
                  <a href="#" className="text-primary hover:underline">Termini di Servizio</a>
                  {" "}e la{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
