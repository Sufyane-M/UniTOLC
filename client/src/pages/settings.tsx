import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  BellRing, 
  Shield, 
  LogOut, 
  Crown
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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Imposta la tab attiva in base ai parametri URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const tab = params.get("tab");
    if (tab && ["profile", "password", "notifications", "premium", "privacy"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Form per il profilo
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

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
    try {
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del profilo",
        variant: "destructive",
      });
    }
  };

  // Gestione submit del form password
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      toast({
        title: "Password aggiornata",
        description: "La tua password è stata aggiornata con successo",
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento della password",
        variant: "destructive",
      });
    }
  };

  // Gestione abbonamento premium
  const handleSubscribePremium = () => {
    toast({
      title: "Abbonamento premium",
      description: "Il tuo abbonamento premium è stato attivato con successo",
    });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Impostazioni account</h1>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar con menu */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center pt-4 pb-6">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={user?.profileImage} alt={user?.username || ""} />
                  <AvatarFallback className="text-lg">{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{user?.fullName || user?.username}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.isPremium && (
                  <Badge className="mt-2 bg-amber-500">
                    <Crown className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>
              <Separator className="my-2" />
              <nav className="flex flex-col space-y-1 pt-2">
                <Button
                  variant={activeTab === "profile" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-4 w-4 mr-2" /> Profilo
                </Button>
                <Button
                  variant={activeTab === "password" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("password")}
                >
                  <Lock className="h-4 w-4 mr-2" /> Password
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("notifications")}
                >
                  <BellRing className="h-4 w-4 mr-2" /> Notifiche
                </Button>
                <Button
                  variant={activeTab === "premium" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("premium")}
                >
                  <Crown className="h-4 w-4 mr-2" /> Premium
                </Button>
                <Button
                  variant={activeTab === "privacy" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("privacy")}
                >
                  <Shield className="h-4 w-4 mr-2" /> Privacy
                </Button>
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Esci
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Contenuto principale */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full md:hidden">
              <TabsTrigger value="profile">Profilo</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="notifications">Notifiche</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* Tab Profilo */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profilo</CardTitle>
                  <CardDescription>
                    Modifica le informazioni del tuo profilo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Il tuo nome e cognome" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Questo è il nome che verrà mostrato agli altri utenti.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Il tuo username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="La tua email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <Button type="submit">Salva modifiche</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Password */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Modifica la tua password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password attuale</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Inserisci la password attuale" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nuova password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Inserisci la nuova password" {...field} />
                            </FormControl>
                            <FormDescription>
                              La password deve avere almeno 8 caratteri.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conferma password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Conferma la nuova password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <Button type="submit">Aggiorna password</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Notifiche */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifiche</CardTitle>
                  <CardDescription>
                    Configura le preferenze di notifica.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Promemoria di studio</p>
                        <p className="text-sm text-muted-foreground">
                          Ricevi email di promemoria per sessioni di studio programmate.
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Aggiornamenti settimanali</p>
                        <p className="text-sm text-muted-foreground">
                          Ricevi un riepilogo settimanale dei tuoi progressi.
                        </p>
                      </div>
                      <Switch 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Push</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Sfide giornaliere</p>
                        <p className="text-sm text-muted-foreground">
                          Ricevi notifiche per nuove sfide giornaliere.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Risposte alla community</p>
                        <p className="text-sm text-muted-foreground">
                          Ricevi notifiche quando qualcuno risponde ai tuoi post.
                        </p>
                      </div>
                      <Switch 
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Salva preferenze</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Tab Premium */}
            <TabsContent value="premium">
              <Card>
                <CardHeader>
                  <CardTitle>Abbonamento Premium</CardTitle>
                  <CardDescription>
                    {user?.isPremium 
                      ? "Gestisci il tuo abbonamento premium" 
                      : "Sblocca tutte le funzionalità premium"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.isPremium ? (
                    <div className="space-y-6">
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center">
                          <Crown className="h-5 w-5 text-amber-500 mr-2" />
                          <p className="font-medium text-amber-800 dark:text-amber-300">
                            Hai un abbonamento Premium attivo
                          </p>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          Il tuo abbonamento si rinnoverà automaticamente il 15 luglio 2024.
                        </p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Dettagli di fatturazione</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <span>•••• •••• •••• 4242</span>
                        </div>
                        <div className="mt-4 flex space-x-4">
                          <Button variant="outline" size="sm">
                            Aggiorna pagamento
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            Annulla abbonamento
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Storico pagamenti</h3>
                        <div className="border rounded-lg divide-y">
                          <div className="px-4 py-3 flex justify-between">
                            <div>
                              <p className="font-medium">Piano Premium mensile</p>
                              <p className="text-sm text-muted-foreground">15 giugno 2024</p>
                            </div>
                            <p className="font-medium">€5,00</p>
                          </div>
                          <div className="px-4 py-3 flex justify-between">
                            <div>
                              <p className="font-medium">Piano Premium mensile</p>
                              <p className="text-sm text-muted-foreground">15 maggio 2024</p>
                            </div>
                            <p className="font-medium">€5,00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-heading font-semibold mb-2">Piano Base</h3>
                          <p className="text-muted-foreground mb-4">Funzionalità limitate</p>
                          <p className="text-3xl font-bold mb-6">Gratuito</p>
                          <ul className="space-y-2 mb-6">
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Accesso limitato ai quiz</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Dashboard di base</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Accesso alla community</span>
                            </li>
                          </ul>
                          <p className="text-sm text-muted-foreground">Il tuo piano attuale</p>
                        </div>

                        <div className="border-2 border-primary rounded-lg p-6 relative">
                          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                            Consigliato
                          </div>
                          <h3 className="text-xl font-heading font-semibold mb-2">Piano Premium</h3>
                          <p className="text-muted-foreground mb-4">Accesso completo</p>
                          <p className="text-3xl font-bold mb-6">€5 <span className="text-lg font-normal text-muted-foreground">/mese</span></p>
                          <ul className="space-y-2 mb-6">
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Accesso illimitato a tutti i quiz</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Spiegazioni dettagliate</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Analytics avanzate</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Piani di studio personalizzati</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Materiali teorici esclusivi</span>
                            </li>
                          </ul>
                          <Button className="w-full" onClick={handleSubscribePremium}>
                            <Crown className="h-4 w-4 mr-2" /> Passa a Premium
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg bg-muted/50">
                        <h3 className="font-medium mb-2">Domande frequenti</h3>
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-sm">Come funziona l'abbonamento Premium?</p>
                            <p className="text-sm text-muted-foreground">L'abbonamento ha un costo di €5 al mese e può essere cancellato in qualsiasi momento.</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Posso cambiare idea dopo l'iscrizione?</p>
                            <p className="text-sm text-muted-foreground">Sì, puoi annullare il tuo abbonamento in qualsiasi momento dalle impostazioni.</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Quali metodi di pagamento accettate?</p>
                            <p className="text-sm text-muted-foreground">Accettiamo pagamenti con carta di credito (Visa, Mastercard, American Express).</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Privacy */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy e sicurezza</CardTitle>
                  <CardDescription>
                    Gestisci le impostazioni di privacy e sicurezza del tuo account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacy del profilo</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Profilo pubblico</p>
                        <p className="text-sm text-muted-foreground">
                          Permetti agli altri utenti di vedere il tuo profilo nella community.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Visibilità progressi</p>
                        <p className="text-sm text-muted-foreground">
                          Mostra i tuoi progressi e punteggi ad altri utenti.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sicurezza</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Sessioni attive</p>
                        <p className="text-sm text-muted-foreground">
                          Visualizza e gestisci i dispositivi connessi al tuo account.
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Gestisci</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Verifica in due passaggi</p>
                        <p className="text-sm text-muted-foreground">
                          Aggiungi un ulteriore livello di sicurezza al tuo account.
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Attiva</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-destructive">Zona pericolo</h3>
                    <p className="text-sm text-muted-foreground">
                      Queste azioni sono irreversibili. Procedi con cautela.
                    </p>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4">
                      <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                        Esporta i tuoi dati
                      </Button>
                      <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                        Elimina account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
