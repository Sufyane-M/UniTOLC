import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Edit, 
  MoreVertical, 
  Plus, 
  Shield, 
  Trash2, 
  Users, 
  Book, 
  HelpCircle, 
  BarChart3, 
  Settings
} from "lucide-react";

// Schema di validazione per il form del quiz
const quizSchema = z.object({
  title: z.string().min(3, { message: "Il titolo deve avere almeno 3 caratteri" }),
  description: z.string().optional(),
  type: z.enum(["simulation", "topic", "flashcard", "daily_challenge"], {
    required_error: "Seleziona un tipo di quiz",
  }),
  subjectId: z.coerce.number({
    required_error: "Seleziona una materia",
  }),
  timeLimit: z.coerce.number().optional(),
  isPremium: z.boolean().default(false),
  questions: z.array(z.number()).optional(),
});

type QuizFormValues = z.infer<typeof quizSchema>;

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);

  // Redirect se non sei admin
  if (isAuthenticated && user?.role !== "admin") {
    setLocation("/dashboard");
  }

  // Fetch degli utenti
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Form per creazione quiz
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "topic",
      timeLimit: undefined,
      isPremium: false,
      questions: [],
    },
  });

  // Mutation per promuovere un utente ad admin
  const promoteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('POST', `/api/admin/users/${userId}/promote`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utente promosso",
        description: "L'utente è stato promosso ad amministratore con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la promozione dell'utente",
        variant: "destructive",
      });
    },
  });

  const handlePromoteUser = (userId: number) => {
    promoteUserMutation.mutate(userId);
  };

  const onSubmitQuiz = (data: QuizFormValues) => {
    console.log("Quiz data:", data);
    toast({
      title: "Quiz creato",
      description: "Il quiz è stato creato con successo",
    });
    setIsAddingQuiz(false);
    form.reset();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-primary mb-6" />
            <h1 className="text-2xl font-heading font-bold mb-4">Accesso riservato</h1>
            <p className="text-muted-foreground text-center mb-6">
              Questa pagina è riservata agli amministratori. Devi accedere con un account amministratore per visualizzare questa sezione.
            </p>
            <Button onClick={() => setLocation("/")}>Torna alla home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return null; // Reindirizzamento gestito sopra
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Pannello di amministrazione</h1>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" /> Utenti
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center">
            <Book className="h-4 w-4 mr-2" /> Contenuti
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" /> Impostazioni
          </TabsTrigger>
        </TabsList>

        {/* Tab Gestione Utenti */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestione utenti</CardTitle>
              <CardDescription>
                Visualizza, modifica e gestisci gli utenti della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Data registrazione</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === "admin" ? (
                            <Badge className="bg-primary-500">Admin</Badge>
                          ) : (
                            <Badge variant="outline">Utente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isPremium ? (
                            <Badge className="bg-amber-500">Premium</Badge>
                          ) : (
                            <Badge variant="outline">Base</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString("it-IT")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Modifica
                              </DropdownMenuItem>
                              {user.role !== "admin" && (
                                <DropdownMenuItem onClick={() => handlePromoteUser(user.id)}>
                                  <Shield className="h-4 w-4 mr-2" /> Promuovi ad admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Gestione Contenuti */}
        <TabsContent value="content">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Quiz e domande</CardTitle>
                  <Dialog open={isAddingQuiz} onOpenChange={setIsAddingQuiz}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Aggiungi quiz
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Crea nuovo quiz</DialogTitle>
                        <DialogDescription>
                          Inserisci i dettagli per creare un nuovo quiz sulla piattaforma
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitQuiz)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Titolo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Titolo del quiz" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrizione</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Descrizione del quiz" 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo</FormLabel>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="simulation">Simulazione</option>
                                    <option value="topic">Argomento specifico</option>
                                    <option value="flashcard">Flashcard</option>
                                    <option value="daily_challenge">Sfida giornaliera</option>
                                  </select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="subjectId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Materia</FormLabel>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="1">Matematica</option>
                                    <option value="2">Fisica</option>
                                    <option value="3">Logica</option>
                                    <option value="4">Chimica</option>
                                  </select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="timeLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tempo limite (secondi)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Tempo in secondi (opzionale)" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="isPremium"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Contenuto Premium
                                  </FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Questo quiz sarà disponibile solo per utenti premium
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit">Crea quiz</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Crea e gestisci quiz, domande e materiali di studio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titolo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Domande</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Simulazione TOLC-I completa</TableCell>
                      <TableCell>Simulazione</TableCell>
                      <TableCell>50</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-500">Premium</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Quiz di matematica - Algebra</TableCell>
                      <TableCell>Argomento specifico</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        <Badge variant="outline">Free</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Flashcard fisica - Meccanica</TableCell>
                      <TableCell>Flashcard</TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>
                        <Badge variant="outline">Free</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Vedi tutti i quiz
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sfide giornaliere</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Aggiungi sfida
                  </Button>
                </div>
                <CardDescription>
                  Gestisci le sfide giornaliere per gli utenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titolo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Difficoltà</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quiz di matematica</TableCell>
                      <TableCell>Oggi</TableCell>
                      <TableCell>Media</TableCell>
                      <TableCell>50 XP</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Rivedi 20 flashcard di fisica</TableCell>
                      <TableCell>Oggi</TableCell>
                      <TableCell>Facile</TableCell>
                      <TableCell>25 XP</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Test di logica</TableCell>
                      <TableCell>Domani</TableCell>
                      <TableCell>Difficile</TableCell>
                      <TableCell>75 XP</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Vedi tutte le sfide
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Analytics */}
        <TabsContent value="analytics">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Utilizzo della piattaforma</CardTitle>
                <CardDescription>
                  Statistiche sull'utilizzo della piattaforma negli ultimi 30 giorni
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Qui verrebbe visualizzato un grafico con i dati di utilizzo</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiche generali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Utenti totali</p>
                    <p className="text-2xl font-bold">1,245</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Utenti premium</p>
                    <p className="text-2xl font-bold">287</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Quiz completati oggi</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Nuovi utenti oggi</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Impostazioni */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni della piattaforma</CardTitle>
              <CardDescription>
                Configura le impostazioni generali della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Registrazione</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="registration-enabled" defaultChecked />
                    <label htmlFor="registration-enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Abilita registrazione nuovi utenti
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Community</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="community-enabled" defaultChecked />
                    <label htmlFor="community-enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Abilita sezione community
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Piano premium</h3>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="premium-price" className="text-sm font-medium leading-none">
                      Prezzo mensile (€)
                    </label>
                    <Input id="premium-price" className="max-w-20" defaultValue="5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Modalità manutenzione</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="maintenance-mode" />
                    <label htmlFor="maintenance-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Attiva modalità manutenzione
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Salva impostazioni</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
