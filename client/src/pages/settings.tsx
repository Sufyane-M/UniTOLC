import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  LogOut, 
  Crown,
  Settings as SettingsIcon,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  Download,
  Trash2,
  Edit3,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

// Schema per il profilo
const profileSchema = z.object({
  fullName: z.string().optional(),
  username: z.string().min(3, { message: "Username deve avere almeno 3 caratteri" }),
  email: z.string().email({ message: "Email non valida" }),
});

// Schema per la password
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Password attuale richiesta" }),
  newPassword: z.string().min(8, { message: "La nuova password deve avere almeno 8 caratteri" }),
  confirmPassword: z.string().min(1, { message: "Conferma password richiesta" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Settings = () => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Funzioni per recuperare dati da Supabase
  const fetchUserData = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // Recupera dati abbonamento
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setSubscriptionData(subscription);
      
      // Simula cronologia pagamenti (da implementare con Stripe)
      if (user.isPremium) {
        setPaymentHistory([
          {
            id: 1,
            date: '2024-01-15',
            amount: '€9.99',
            status: 'Completato',
            description: 'Abbonamento Premium - Gennaio 2024'
          },
          {
            id: 2,
            date: '2023-12-15',
            amount: '€9.99',
            status: 'Completato',
            description: 'Abbonamento Premium - Dicembre 2023'
          }
        ]);
      }
      
      // Simula sessioni attive
      setActiveSessions([
        {
          id: 1,
          device: 'Chrome su Windows',
          location: 'Milano, Italia',
          lastActive: new Date().toISOString(),
          current: true
        }
      ]);
      
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    } finally {
      setLoadingData(false);
    }
  };
  
  // Imposta la tab attiva in base ai parametri URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const tab = params.get("tab");
    if (tab && ["profile", "password", "abbonamento", "sicurezza-avanzata"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);
  
  // Carica i dati quando l'utente è disponibile
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Form per il profilo
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  // Aggiorna i valori del form quando l'utente cambia
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  // Form per la password
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Gestione submit del form profilo
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("Utente non autenticato");
      
      // Aggiorna i dati del profilo nel database
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          username: data.username,
          email: data.email,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Aggiorna anche l'email in Supabase Auth se è cambiata
      if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email
        });
        
        if (authError) {
          console.warn('Errore aggiornamento email auth:', authError);
          toast({
            title: "⚠️ Attenzione",
            description: "Profilo aggiornato, ma verifica la nuova email per completare il cambio.",
          });
          return;
        }
      }
      
      toast({
        title: "✅ Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error: any) {
      console.error('Errore aggiornamento profilo:', error);
      toast({
        title: "❌ Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del profilo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestione submit del form password
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      // Verifica la password attuale effettuando un re-login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword
      });
      
      if (signInError) {
        throw new Error('Password attuale non corretta');
      }
      
      // Aggiorna la password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: "✅ Password aggiornata",
        description: "La tua password è stata aggiornata con successo",
      });
      passwordForm.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error('Errore aggiornamento password:', error);
      toast({
        title: "❌ Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento della password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestione abbonamento premium
  const handleSubscribePremium = () => {
    toast({
      title: "Abbonamento premium",
      description: "Il tuo abbonamento premium è stato attivato con successo",
    });
  };
  
  // Gestione cancellazione account
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      
      // Elimina l'utente da Supabase Auth
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      toast({
        title: "✅ Account eliminato",
        description: "Il tuo account è stato eliminato con successo",
      });
      
      // Logout e redirect
      await logout();
      setLocation("/");
      
    } catch (error: any) {
      console.error('Errore eliminazione account:', error);
      toast({
        title: "❌ Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione dell'account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestione esportazione dati
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      // Recupera tutti i dati dell'utente
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      const { data: userExams } = await supabase
        .from('user_exams')
        .select('*')
        .eq('user_id', user?.id);
      
      const { data: quizAttempts } = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('user_id', user?.id);
      
      const exportData = {
        profile: userData,
        exams: userExams,
        quizAttempts: quizAttempts,
        exportDate: new Date().toISOString()
      };
      
      // Crea e scarica il file JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dati-account-${user?.username}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Dati esportati",
        description: "I tuoi dati sono stati esportati con successo",
      });
      
    } catch (error: any) {
      console.error('Errore esportazione dati:', error);
      toast({
        title: "❌ Errore",
        description: error.message || "Si è verificato un errore durante l'esportazione dei dati",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // Aggiorna lo stato dell'abbonamento nel database
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .eq('status', 'active');
      
      if (error) throw error;
      
      // Aggiorna lo stato locale
      await fetchUserData();
      
      toast({
        title: "✅ Abbonamento cancellato",
        description: "Il tuo abbonamento è stato cancellato. Rimarrà attivo fino alla data di scadenza.",
      });
    } catch (error: any) {
      console.error('Errore cancellazione abbonamento:', error);
      toast({
        title: "❌ Errore",
        description: error.message || "Impossibile cancellare l'abbonamento. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    setIsLoading(true);
    try {
      // Simula il processo di upgrade (da integrare con Stripe)
      // Per ora creiamo un record di abbonamento nel database
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user?.id,
          plan: 'premium',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni
          payment_method: 'Carta di credito',
          amount: 9.99
        });
      
      if (error) throw error;
      
      // Aggiorna lo stato dell'utente
      const { error: userError } = await supabase
        .from('users')
        .update({ is_premium: true })
        .eq('id', user?.id);
      
      if (userError) throw userError;
      
      // Ricarica i dati
      await fetchUserData();
      
      toast({
        title: "🎉 Benvenuto in Premium!",
        description: "Il tuo abbonamento Premium è stato attivato con successo.",
      });
      
      // Reindirizza alla tab abbonamento
      setActiveTab('abbonamento');
      
    } catch (error: any) {
      console.error('Errore upgrade Premium:', error);
      toast({
        title: "❌ Errore",
        description: error.message || "Impossibile completare l'upgrade. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // Simula la terminazione di una sessione
      // In un'implementazione reale, questo dovrebbe chiamare l'API di Supabase Auth
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "✅ Sessione terminata",
        description: "La sessione è stata terminata con successo.",
      });
    } catch (error: any) {
      console.error('Errore terminazione sessione:', error);
      toast({
        title: "❌ Errore",
        description: "Impossibile terminare la sessione. Riprova più tardi.",
        variant: "destructive",
      });
    }
  };

  // Gestione logout
  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-primary mb-6" />
            <h1 className="text-2xl font-heading font-bold mb-4">Accesso richiesto</h1>
            <p className="text-muted-foreground text-center mb-6">
              Devi accedere al tuo account per visualizzare e modificare le impostazioni.
            </p>
            <Button onClick={() => setLocation("/?auth=login")}>Accedi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header moderno */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Impostazioni Account
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Gestisci il tuo profilo, sicurezza e preferenze
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar migliorata */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Card profilo utente */}
            <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
                      <AvatarImage src={user?.profileImage} alt={user?.username || ""} />
                      <AvatarFallback className="text-xl font-bold bg-white/20 text-white">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {user?.isPremium && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1.5 shadow-lg">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="font-semibold text-lg">{user?.fullName || user?.username}</h3>
                    <p className="text-white/80 text-sm">{user?.email}</p>
                    {user?.isPremium && (
                      <Badge className="mt-2 bg-amber-500/20 text-amber-100 border-amber-400/30">
                        <Crown className="h-3 w-3 mr-1" /> Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-0">
                <nav className="p-2">
                  <div className="space-y-1">
                    <Button
                      variant={activeTab === "profile" ? "secondary" : "ghost"}
                      className="w-full justify-start h-12 text-left font-medium transition-all duration-200 hover:bg-primary/5"
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="h-5 w-5 mr-3" /> 
                      <span>Informazioni Profilo</span>
                    </Button>
                    <Button
                      variant={activeTab === "password" ? "secondary" : "ghost"}
                      className="w-full justify-start h-12 text-left font-medium transition-all duration-200 hover:bg-primary/5"
                      onClick={() => setActiveTab("password")}
                    >
                      <Lock className="h-5 w-5 mr-3" /> 
                      <span>Sicurezza</span>
                    </Button>
                    <Button
                      variant={activeTab === "abbonamento" ? "secondary" : "ghost"}
                      className="w-full justify-start h-12 text-left font-medium transition-all duration-200 hover:bg-primary/5"
                      onClick={() => setActiveTab("abbonamento")}
                    >
                      <Crown className="h-5 w-5 mr-3" /> 
                      <span>Abbonamento</span>
                    </Button>
                    <Button
                      variant={activeTab === "sicurezza-avanzata" ? "secondary" : "ghost"}
                      className="w-full justify-start h-12 text-left font-medium transition-all duration-200 hover:bg-primary/5"
                      onClick={() => setActiveTab("sicurezza-avanzata")}
                    >
                      <Shield className="h-5 w-5 mr-3" /> 
                      <span>Sicurezza Avanzata</span>
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 text-left font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5 mr-3" /> 
                        <span>Esci dall'Account</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Conferma Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sei sicuro di voler uscire dal tuo account? Dovrai effettuare nuovamente l'accesso per utilizzare la piattaforma.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                          Esci
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </nav>
              </CardContent>
            </Card>
            
            {/* Card informazioni rapide */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Informazioni Account
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Membro dal</span>
                    <span className="font-medium">Gennaio 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ultimo accesso</span>
                    <span className="font-medium">Oggi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Piano</span>
                    <Badge variant={user?.isPremium ? "default" : "secondary"} className="text-xs">
                      {user?.isPremium ? "Premium" : "Gratuito"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contenuto principale */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header sezione */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Informazioni Profilo</h2>
                      <p className="text-muted-foreground">Gestisci i tuoi dati personali e le informazioni del profilo</p>
                    </div>
                  </div>

                  {/* Card principale profilo */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={user?.profileImage} alt={user?.username || ""} />
                            <AvatarFallback className="text-lg font-bold">
                              {user?.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0">
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div>
                          <CardTitle className="text-xl">Modifica Profilo</CardTitle>
                          <CardDescription className="text-base">
                            Aggiorna le tue informazioni personali e mantieni il tuo profilo sempre aggiornato
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Nome Completo
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Inserisci il tuo nome completo" 
                                      className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-primary transition-colors"
                                      {...field} 
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Username
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Scegli un username unico" 
                                      className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-primary transition-colors"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Indirizzo Email
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="La tua email principale" 
                                    type="email" 
                                    className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-primary transition-colors"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription className="text-sm text-muted-foreground">
                                  Utilizziamo la tua email per inviarti aggiornamenti importanti e notifiche di sicurezza
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button 
                              type="submit" 
                              disabled={isLoading}
                              className="flex-1 h-12 font-semibold transition-all duration-200 hover:shadow-lg"
                            >
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Salva Modifiche
                                </>
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => profileForm.reset()}
                              className="h-12 px-6 font-semibold"
                            >
                              Annulla
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  {/* Card informazioni aggiuntive */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Sicurezza Account
                      </CardTitle>
                      <CardDescription>
                        Informazioni sulla sicurezza del tuo account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Email Verificata</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {user?.email ? 'Il tuo account è sicuro' : 'Email non verificata'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-200">Ultimo Accesso</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {user?.lastActive 
                                ? new Date(user.lastActive).toLocaleString('it-IT', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Non disponibile'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "password" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header sezione */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Lock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Sicurezza</h2>
                      <p className="text-muted-foreground">Gestisci la password e le impostazioni di sicurezza del tuo account</p>
                    </div>
                  </div>

                  {/* Card cambio password */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                          <Lock className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Modifica Password</CardTitle>
                          <CardDescription className="text-base">
                            Aggiorna la tua password per mantenere il tuo account sicuro e protetto
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 dark:text-amber-200">Suggerimenti per una password sicura</AlertTitle>
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          Usa almeno 8 caratteri, includi lettere maiuscole e minuscole, numeri e simboli speciali.
                        </AlertDescription>
                      </Alert>

                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  Password Attuale
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type={showCurrentPassword ? "text" : "password"}
                                      placeholder="Inserisci la tua password attuale" 
                                      className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-primary transition-colors pr-12"
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                      {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Nuova Password
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Crea una nuova password" 
                                        className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-primary transition-colors pr-12"
                                        {...field} 
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                      >
                                        {showNewPassword ? (
                                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Conferma Password
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Ripeti la nuova password" 
                                        className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-primary transition-colors pr-12"
                                        {...field} 
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      >
                                        {showConfirmPassword ? (
                                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button 
                              type="submit" 
                              disabled={isLoading}
                              className="flex-1 h-12 font-semibold transition-all duration-200 hover:shadow-lg"
                            >
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Aggiornando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Aggiorna Password
                                </>
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                passwordForm.reset();
                                setShowCurrentPassword(false);
                                setShowNewPassword(false);
                                setShowConfirmPassword(false);
                              }}
                              className="h-12 px-6 font-semibold"
                            >
                              Annulla
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  {/* Card sessioni attive */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Sessioni Attive
                      </CardTitle>
                      <CardDescription>
                        Monitora i dispositivi che hanno accesso al tuo account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingData ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                          <span className="ml-3 text-muted-foreground">Caricamento sessioni...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeSessions.map((session) => (
                            <div key={session.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                              session.current 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800'
                            }`}>
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  session.current ? 'bg-green-500/10' : 'bg-slate-500/10'
                                }`}>
                                  <CheckCircle className={`h-5 w-5 ${
                                    session.current ? 'text-green-600' : 'text-slate-600'
                                  }`} />
                                </div>
                                <div>
                                  <p className={`font-medium ${
                                    session.current 
                                      ? 'text-green-800 dark:text-green-200' 
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}>
                                    {session.current ? 'Sessione Corrente' : session.device}
                                  </p>
                                  <p className={`text-sm ${
                                    session.current 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {session.device} • {session.location} • {new Date(session.lastActive).toLocaleString('it-IT')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={session.current 
                                  ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                  : "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                                }>
                                  {session.current ? 'Attiva' : 'Inattiva'}
                                </Badge>
                                {!session.current && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleTerminateSession(session.id.toString())}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-3">
                              Non vedi sessioni sospette? Il tuo account è sicuro.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const otherSessions = activeSessions.filter(s => !s.current);
                                otherSessions.forEach(session => handleTerminateSession(session.id.toString()));
                              }}
                              disabled={activeSessions.filter(s => !s.current).length === 0}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Termina Tutte le Altre Sessioni
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "abbonamento" && (
                <motion.div
                  key="abbonamento"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header sezione */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Crown className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Abbonamento</h2>
                      <p className="text-muted-foreground">Gestisci il tuo piano e visualizza i dettagli di fatturazione</p>
                    </div>
                  </div>

                  {/* Card piano attuale */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                    <div className={`h-2 ${user?.isPremium ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-slate-400 to-slate-600'}`} />
                    <CardHeader className="pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${user?.isPremium ? 'bg-amber-500/10' : 'bg-slate-500/10'}`}>
                            <Crown className={`h-6 w-6 ${user?.isPremium ? 'text-amber-600' : 'text-slate-600'}`} />
                          </div>
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                              Piano {user?.isPremium ? "Premium" : "Base"}
                              <Badge 
                                variant={user?.isPremium ? "default" : "secondary"} 
                                className={user?.isPremium ? "bg-amber-500 hover:bg-amber-600" : ""}
                              >
                                {user?.isPremium ? "Attivo" : "Gratuito"}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-base">
                              {user?.isPremium 
                                ? "Hai accesso completo a tutte le funzionalità premium" 
                                : "Accesso limitato alle funzionalità base della piattaforma"
                              }
                            </CardDescription>
                          </div>
                        </div>
                        {user?.isPremium && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-600">€9.99</p>
                            <p className="text-sm text-muted-foreground">al mese</p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-200">Simulazioni</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {user?.isPremium ? "Illimitate" : "5 al mese"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Supporto</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {user?.isPremium ? "Prioritario" : "Standard"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-purple-800 dark:text-purple-200">Statistiche</p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                              {user?.isPremium ? "Avanzate" : "Base"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {user?.isPremium && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Prossimo rinnovo</p>
                              <p className="text-sm text-muted-foreground">
                                {subscriptionData?.end_date 
                                  ? new Date(subscriptionData.end_date).toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric'
                                    })
                                  : 'Non disponibile'
                                }
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Fattura
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    Cancella
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancella Abbonamento</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Sei sicuro di voler cancellare il tuo abbonamento Premium? 
                                      L'abbonamento rimarrà attivo fino alla data di scadenza, 
                                      ma non verrà rinnovato automaticamente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={handleCancelSubscription}
                                      disabled={isLoading}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      {isLoading ? "Cancellazione..." : "Conferma Cancellazione"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          {subscriptionData && (
                            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Stato abbonamento:</span>
                                <Badge variant={subscriptionData.status === 'active' ? 'default' : 'secondary'}>
                                  {subscriptionData.status === 'active' ? 'Attivo' : subscriptionData.status}
                                </Badge>
                              </div>
                              {subscriptionData.payment_method && (
                                <div className="flex items-center justify-between text-sm mt-2">
                                  <span className="text-muted-foreground">Metodo di pagamento:</span>
                                  <span className="font-medium">{subscriptionData.payment_method}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cronologia pagamenti (solo per utenti premium) */}
                  {user?.isPremium && (
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          Cronologia Pagamenti
                        </CardTitle>
                        <CardDescription>
                          Visualizza la cronologia completa dei tuoi pagamenti
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingData ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            <span className="ml-3 text-muted-foreground">Caricamento cronologia...</span>
                          </div>
                        ) : paymentHistory.length > 0 ? (
                          <div className="space-y-3">
                            {paymentHistory.map((payment) => (
                              <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-green-500/10 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{payment.description}</p>
                                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <div>
                                    <p className="font-semibold">{payment.amount}</p>
                                    <Badge variant="outline" className={`text-xs ${
                                      payment.status === 'Completato' 
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>
                                      {payment.status}
                                    </Badge>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Nessun pagamento trovato</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Upgrade per utenti base */}
                  {!user?.isPremium && (
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                          <Crown className="h-8 w-8" />
                          <div>
                            <h3 className="text-2xl font-bold">Passa a Premium</h3>
                            <p className="text-amber-100">Sblocca tutto il potenziale della piattaforma</p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Piano Base */}
                          <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="text-center mb-6">
                              <h4 className="text-xl font-bold mb-2">Piano Base</h4>
                              <div className="text-3xl font-bold text-slate-600">Gratuito</div>
                              <p className="text-sm text-muted-foreground mt-2">Per iniziare</p>
                            </div>
                            <ul className="space-y-3 mb-6">
                              {[
                                "5 simulazioni al mese",
                                "Accesso alle funzionalità base",
                                "Supporto via email",
                                "Statistiche limitate"
                              ].map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-slate-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <Badge variant="secondary" className="w-full justify-center py-2">
                              Piano Attuale
                            </Badge>
                          </div>
                          
                          {/* Piano Premium */}
                          <div className="p-6 border-2 border-amber-400 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                              Popolare
                            </div>
                            <div className="text-center mb-6">
                              <h4 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                                <Crown className="h-5 w-5 text-amber-600" />
                                Piano Premium
                              </h4>
                              <div className="text-3xl font-bold text-amber-600">
                                €9.99
                                <span className="text-lg font-normal text-muted-foreground">/mese</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">Tutto incluso</p>
                            </div>
                            <ul className="space-y-3 mb-6">
                              {[
                                "Simulazioni illimitate",
                                "Tutte le funzionalità premium",
                                "Supporto prioritario",
                                "Statistiche avanzate",
                                "Esportazione dati",
                                "Accesso anticipato alle novità"
                              ].map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-amber-600" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <Button 
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3"
                              onClick={handleUpgradeToPremium}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Attivazione...
                                </>
                              ) : (
                                <>
                                  <Crown className="h-4 w-4 mr-2" />
                                  Inizia Ora
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}


                  
                  {/* FAQ Accordion */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Domande Frequenti
                      </CardTitle>
                      <CardDescription>
                        Risposte alle domande più comuni sull'abbonamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="text-left">
                            Posso cancellare il mio abbonamento in qualsiasi momento?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            Sì, puoi cancellare il tuo abbonamento in qualsiasi momento dalle impostazioni del tuo account. 
                            L'accesso Premium rimarrà attivo fino alla fine del periodo di fatturazione corrente.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="text-left">
                            Cosa succede se cancello l'abbonamento?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            Dopo la cancellazione, il tuo account tornerà automaticamente al piano Base con accesso 
                            limitato alle funzionalità. Tutti i tuoi dati rimarranno salvati.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="text-left">
                            Posso cambiare piano in qualsiasi momento?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            Assolutamente sì! Puoi passare da Base a Premium o viceversa in qualsiasi momento. 
                            Le modifiche avranno effetto immediato per gli upgrade, mentre i downgrade saranno 
                            applicati al prossimo ciclo di fatturazione.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                          <AccordionTrigger className="text-left">
                            Quali metodi di pagamento accettate?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            Accettiamo tutte le principali carte di credito (Visa, Mastercard, American Express), 
                            PayPal e bonifici bancari. Tutti i pagamenti sono elaborati in modo sicuro.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "sicurezza-avanzata" && (
                <motion.div
                  key="sicurezza-avanzata"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header sezione */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Sicurezza Avanzata</h2>
                      <p className="text-muted-foreground">Gestisci le impostazioni di sicurezza avanzate e le azioni critiche del tuo account</p>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Zona Pericolosa
                      </CardTitle>
                      <CardDescription>
                        Azioni irreversibili che influenzano permanentemente il tuo account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Esportazione dati */}
                        <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <div className="flex items-start gap-3">
                            <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                Esporta i tuoi dati
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                Scarica una copia completa di tutti i tuoi dati in formato JSON
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleExportData}
                                disabled={isLoading}
                                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
                              >
                                {isLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                                    Esportando...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Esporta Dati
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Cancellazione account */}
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <div className="flex items-start gap-3">
                            <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                                Elimina account
                              </h4>
                              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                Elimina permanentemente il tuo account e tutti i dati associati
                              </p>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Elimina Account
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                      <AlertCircle className="h-5 w-5" />
                                      Conferma Eliminazione Account
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-2">
                                      <p>
                                        <strong>Attenzione:</strong> Questa azione è irreversibile e comporterà:
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Eliminazione permanente di tutti i tuoi dati</li>
                                        <li>Perdita di accesso a tutte le funzionalità</li>
                                        <li>Cancellazione automatica dell'abbonamento</li>
                                        <li>Impossibilità di recuperare l'account</li>
                                      </ul>
                                      <p className="mt-3">
                                        Sei sicuro di voler procedere con l'eliminazione del tuo account?
                                      </p>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={handleDeleteAccount}
                                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                      disabled={isLoading}
                                    >
                                      {isLoading ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                          Eliminando...
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Elimina Definitivamente
                                        </>
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQ Sicurezza */}
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Domande Frequenti - Sicurezza
                      </CardTitle>
                      <CardDescription>
                        Risposte alle domande più comuni sulla sicurezza del tuo account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="text-left">
                            Cosa succede quando esporto i miei dati?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            L'esportazione crea un file JSON contenente tutti i tuoi dati personali, 
                            cronologia degli esami, risultati dei quiz e impostazioni dell'account. 
                            Il file viene scaricato direttamente sul tuo dispositivo e non viene condiviso con terze parti.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="text-left">
                            Posso recuperare il mio account dopo averlo eliminato?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            No, l'eliminazione dell'account è permanente e irreversibile. 
                            Tutti i dati vengono cancellati definitivamente dai nostri server e non possono essere recuperati. 
                            Ti consigliamo di esportare i tuoi dati prima di procedere con l'eliminazione.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="text-left">
                            Come posso proteggere meglio il mio account?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            Utilizza una password forte e unica, abilita l'autenticazione a due fattori se disponibile, 
                            mantieni aggiornato il tuo indirizzo email e controlla regolarmente le sessioni attive. 
                            Non condividere mai le tue credenziali con altri.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                          <AccordionTrigger className="text-left">
                            Cosa devo fare se sospetto un accesso non autorizzato?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            Cambia immediatamente la tua password, termina tutte le sessioni attive dalla sezione Sicurezza, 
                            controlla la cronologia degli accessi e contatta il nostro supporto. 
                            Se necessario, considera l'esportazione dei dati come misura precauzionale.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                          <AccordionTrigger className="text-left">
                            I miei dati sono al sicuro?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            Sì, utilizziamo crittografia avanzata per proteggere i tuoi dati sia in transito che a riposo. 
                            I nostri server sono protetti da misure di sicurezza all'avanguardia e rispettiamo 
                            rigorosamente le normative sulla privacy dei dati (GDPR).
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
