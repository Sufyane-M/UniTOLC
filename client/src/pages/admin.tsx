import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Settings,
  FileQuestion,
  Eye,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Activity,
  Database,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Award,
  Zap,
  Star,
  TrendingUp,
  Timer,
  Layers,
  FileText,
  X
} from "lucide-react";

// Schema di validazione per il form del quiz
const quizSchema = z.object({
  title: z.string().min(3, { message: "Il titolo deve avere almeno 3 caratteri" }),
  description: z.string().optional(),
  type: z.enum(["simulation", "topic", "daily_challenge"], {
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

// Schema di validazione per il form di modifica utente
const editUserSchema = z.object({
  username: z.string().min(3, { message: "Lo username deve avere almeno 3 caratteri" }),
  email: z.string().email({ message: "Inserisci un'email valida" }),
  fullName: z.string().optional(),
  role: z.enum(["user", "admin"], {
    required_error: "Seleziona un ruolo",
  }),
  isPremium: z.boolean().default(false),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

// Schema di validazione per il form di modifica materia
const editSubjectSchema = z.object({
  name: z.string().min(1, { message: "Il nome della materia non può essere vuoto" }),
  description: z.string().optional(),
  exam_type: z.string().min(1, { message: "Il tipo di esame è richiesto" }),
});

type EditSubjectFormValues = z.infer<typeof editSubjectSchema>;

// Interfacce per i dati
interface SubjectQuestion {
  id: number;
  text: string;
  options: string | Array<{id: string, text: string}> | {[key: string]: string};
  correct_answer: string;
  difficulty: 'facile' | 'media' | 'difficile';
  topic_name?: string;
  created_at?: string;
}

interface Subject {
  id: number;
  name: string;
  description?: string;
  exam_type: string;
  question_count: number;
  created_at: string;
}

const Admin = () => {
  const handleExportUsers = () => {
    if (!users) return;

    const data = users.map((user: any) => ({
      ID: user.id,
      Username: user.username,
      Email: user.email,
      Ruolo: user.role,
      Premium: user.isPremium ? 'Sì' : 'No',
      'Data registrazione': new Date(user.createdAt).toLocaleDateString('it-IT'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Utenti');

    // Auto-dimensiona le colonne
    const objectMaxLength = [];
    for (let i = 0; i < data.length; i++) {
      const value = Object.values(data[i]);
      for (let j = 0; j < value.length; j++) {
        const key = Object.keys(data[i])[j];
        const length = Math.max(String(value[j] || '').length, key.length);
        objectMaxLength[j] = Math.max(objectMaxLength[j] || 0, length);
      }
    }
    worksheet['!cols'] = objectMaxLength.map(w => ({ width: w + 2 }));

    XLSX.writeFile(workbook, 'utenti.xlsx');
  };

  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [auditLogFilters, setAuditLogFilters] = useState({ action: "", entity: "" });
  const [impersonationTarget, setImpersonationTarget] = useState("");
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Stati per le nuove funzionalità delle materie
  const [isViewingSubjectQuestions, setIsViewingSubjectQuestions] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [subjectQuestions, setSubjectQuestions] = useState<any[]>([]);
  const [isLoadingSubjectQuestions, setIsLoadingSubjectQuestions] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);


  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Redirect se non sei admin
  if (isAuthenticated && user?.role !== "admin") {
    setLocation("/dashboard");
  }

  // Fetch degli utenti
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/admin/users', { search: debouncedSearchTerm }],
    queryFn: async ({ queryKey }) => {
      const [, { search }] = queryKey;
      const searchParam = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const response = await apiRequest('GET', `/api/admin/users${searchParam}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Debug logging
  console.log('Admin page debug:', {
    isAuthenticated,
    userRole: user?.role,
    usersLoading,
    usersError,
    usersData: users,
    queryEnabled: isAuthenticated && user?.role === "admin"
  });

  // Fetch support tickets
  const { data: supportTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/admin/support-tickets'],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['/api/admin/audit-logs', auditLogFilters],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Fetch system stats
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/system-stats'],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Fetch subjects with question counts
  const { data: subjectsWithQuestions, isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/admin/subjects-questions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/subjects-questions');
      if (!response.ok) {
        throw new Error('Failed to fetch subjects with questions');
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  // Fetch TOLC exam types
  const { data: tolcExamTypes, isLoading: tolcExamTypesLoading } = useQuery({
    queryKey: ['/api/admin/tolc-exam-types'],
    queryFn: async () => {
      const response = await fetch('/api/admin/tolc-exam-types');
      if (!response.ok) {
        throw new Error('Failed to fetch TOLC exam types');
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  // State for modal
  const [selectedExamType, setSelectedExamType] = useState<number | null>(null);
  const [examSections, setExamSections] = useState<any[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  
  // Function to fetch sections for a specific exam type
  const fetchExamSections = async (examTypeId: number) => {
    setIsLoadingSections(true);
    try {
      const response = await fetch(`/api/admin/tolc-exam-sections/${examTypeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch TOLC exam sections');
      }
      const data = await response.json();
      setExamSections(data);
      setSelectedExamType(examTypeId);
      setShowSectionsModal(true);
    } catch (error) {
      console.error('Error fetching exam sections:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le sezioni dell'esame",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSections(false);
    }
  };

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

  // Form per modifica utente
  const editUserForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      role: "user",
      isPremium: false,
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

  // Mutation per eliminare un utente
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utente eliminato",
        description: "L'utente è stato eliminato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione dell'utente",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (user: any) => {
    if (user.role === 'admin') {
      toast({
        title: "Operazione non consentita",
        description: "Non è possibile eliminare un amministratore",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Sei sicuro di voler eliminare l'utente ${user.username}? Questa azione non può essere annullata.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  // Mutation per modificare un utente
  const editUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: EditUserFormValues }) => {
      await apiRequest('PUT', `/api/admin/users/${userId}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utente modificato",
        description: "L'utente è stato modificato con successo",
      });
      setIsEditingUser(false);
      setSelectedUser(null);
      editUserForm.reset();
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la modifica dell'utente",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    editUserForm.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      role: user.role,
      isPremium: user.isPremium,
    });
    setIsEditingUser(true);
  };

  const onSubmitEditUser = (data: EditUserFormValues) => {
    if (selectedUser) {
      editUserMutation.mutate({ userId: selectedUser.id, userData: data });
    }
  };

  // Mutation per aggiornare stato ticket
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number; status: string }) => {
      await apiRequest('PUT', `/api/admin/support-tickets/${ticketId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support-tickets'] });
      toast({
        title: "Ticket aggiornato",
        description: "Lo stato del ticket è stato aggiornato con successo",
      });
    },
  });

  // Mutation per impersonare utente
  const impersonateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('POST', `/api/admin/impersonate/${userId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Impersonificazione avviata",
        description: "Ora stai visualizzando l'applicazione come l'utente selezionato",
      });
      setLocation("/dashboard");
    },
  });

  // Mutation per terminare impersonificazione
  const stopImpersonationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/stop-impersonation', {});
    },
    onSuccess: () => {
      toast({
        title: "Impersonificazione terminata",
        description: "Sei tornato al tuo account amministratore",
      });
      queryClient.invalidateQueries();
    },
  });

  const handleUpdateTicket = (ticketId: number, status: string) => {
    updateTicketMutation.mutate({ ticketId, status });
  };

  const handleImpersonateUser = (userId: number) => {
    impersonateUserMutation.mutate(userId);
  };

  // Funzioni per gestire le azioni della sezione "Materie e domande"
  const handleViewSubjectQuestions = async (subjectId: number) => {
    setIsLoadingSubjectQuestions(true);
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch subject questions');
      }
      const data = await response.json();
      setSubjectQuestions(data.data || []);
      
      // Trova la materia selezionata
      const subject = subjectsWithQuestions?.find(s => s.id === subjectId);
      setSelectedSubject(subject || null);
      setIsViewingSubjectQuestions(true);
    } catch (error) {
      console.error('Error fetching subject questions:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le domande della materia",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSubjectQuestions(false);
    }
  };



  const handleEditSubject = async (subjectId: number) => {
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subject');
      }
      const subject = await response.json();
      setSelectedSubject(subject);
      
      // Imposta i valori del form per la modifica
      editSubjectForm.reset({
        name: subject.name,
        description: subject.description || "",
        exam_type: subject.exam_type
      });
      setIsEditingSubject(true);
    } catch (error) {
      console.error('Error fetching subject:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati della materia",
        variant: "destructive"
      });
    }
  };

  // Form per modifica materia
  const editSubjectForm = useForm<EditSubjectFormValues>({
    resolver: zodResolver(editSubjectSchema),
    defaultValues: {
      name: "",
      description: "",
      exam_type: "TOLC-I",
    },
  });

  // Mutation per modificare una materia
  const editSubjectMutation = useMutation({
    mutationFn: async ({ subjectId, subjectData }: { subjectId: number; subjectData: EditSubjectFormValues }) => {
      await apiRequest('PUT', `/api/admin/subjects/${subjectId}`, subjectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects-questions'] });
      toast({
        title: "Materia modificata",
        description: "La materia è stata modificata con successo",
      });
      setIsEditingSubject(false);
      setSelectedSubject(null);
      editSubjectForm.reset();
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la modifica della materia",
        variant: "destructive",
      });
    },
  });

  const onSubmitEditSubject = (data: EditSubjectFormValues) => {
    if (selectedSubject) {
      editSubjectMutation.mutate({ subjectId: selectedSubject.id, subjectData: data });
    }
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
            <Button onClick={() => setLocation("/dashboard")}>Torna alla dashboard</Button>
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
          <TabsTrigger value="support" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" /> Supporto
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" /> Audit Log
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Database className="h-4 w-4 mr-2" /> Sistema
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" /> Impostazioni
          </TabsTrigger>
        </TabsList>

        {/* Tab Gestione Utenti */}
        <TabsContent value="users">
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <CardHeader className="space-y-2 md:space-y-3 bg-gradient-to-r from-card to-muted/30 pb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl md:text-2xl tracking-tight">Gestione utenti</CardTitle>
                  <CardDescription className="text-sm md:text-base mt-1">
                    Visualizza, modifica e gestisci gli utenti della piattaforma
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 self-end">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cerca utenti..." 
                      className="w-full pl-9 sm:w-[200px] md:w-[250px] h-9 rounded-full"
                      aria-label="Cerca utenti"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : usersError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-semibold mb-2">Errore nel caricamento utenti</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {usersError instanceof Error ? usersError.message : 'Errore sconosciuto'}
                  </p>
                  <Button onClick={() => window.location.reload()} className="rounded-full">
                    <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                    Riprova
                  </Button>
                </div>
              ) : !users || users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-semibold mb-2">Nessun utente trovato</h3>
                  <p className="text-muted-foreground max-w-md">
                    Non ci sono utenti registrati nel sistema.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg">
                  <Table className="border-collapse w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="hidden md:table-cell">ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead>Ruolo</TableHead>
                        <TableHead className="hidden sm:table-cell">Premium</TableHead>
                        <TableHead className="hidden lg:table-cell">Data registrazione</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user: any) => (
                        <TableRow 
                          key={user.id} 
                          className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
                        >
                          <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">{user.id}</TableCell>
                          <TableCell className="font-medium truncate max-w-[150px]">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <div>{user.username}</div>
                                <div className="sm:hidden text-xs text-muted-foreground truncate">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell truncate max-w-[200px]">{user.email}</TableCell>
                          <TableCell>
                            {user.role === "admin" ? (
                              <Badge className="bg-primary text-white font-medium" aria-label="Admin">
                                <Shield className="h-3 w-3 mr-1" aria-hidden="true" /> Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" aria-label="Utente">Utente</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {user.isPremium ? (
                              <Badge className="bg-amber-500 text-white" aria-label="Premium">
                                <Star className="h-3 w-3 mr-1" aria-hidden="true" /> Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline" aria-label="Base">Base</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString("it-IT")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label="Opzioni utente">
                                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[180px]">
                                <DropdownMenuItem onClick={() => handleEditUser(user)} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" aria-hidden="true" /> Modifica
                                </DropdownMenuItem>
                                {user.role !== "admin" && (
                                  <DropdownMenuItem onClick={() => handlePromoteUser(user.id)} className="cursor-pointer">
                                    <Shield className="h-4 w-4 mr-2" aria-hidden="true" /> Promuovi ad admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" /> Elimina
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t p-4 bg-muted/20">
              <div className="text-sm text-muted-foreground">
                {users?.length} utenti totali
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 rounded-full">
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" /> Aggiungi utente
                </Button>
                <Button size="sm" className="h-8 rounded-full" onClick={handleExportUsers}>
                  <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" /> Esporta
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab Gestione Contenuti */}
        <TabsContent value="content">
          <div className="grid gap-6 grid-cols-1">
            {/* Materie e domande */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Materie e domande</CardTitle>
                    <CardDescription>
                      Visualizza tutte le materie e il numero di domande disponibili per ciascuna
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => window.open('/admin/tolc-questions', '_blank')}>
                    <FileQuestion className="h-4 w-4 mr-2" /> Gestisci domande TOLC
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {subjectsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !subjectsWithQuestions || subjectsWithQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Book className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nessuna materia trovata</h3>
                    <p className="text-muted-foreground">
                      Non ci sono materie configurate nel sistema.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Materia</TableHead>
                        <TableHead className="text-center">Numero di domande</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectsWithQuestions.map((subject: any) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.subject_name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={subject.question_count > 0 ? "default" : "outline"}>
                              {subject.question_count} domande
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewSubjectQuestions(subject.id)}>
                                  <Eye className="h-4 w-4 mr-2" /> Visualizza domande
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleEditSubject(subject.id)}>
                                  <Edit className="h-4 w-4 mr-2" /> Modifica materia
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
            
            {/* TOLC Exam Types */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tipi di esame TOLC</CardTitle>
                    <CardDescription>
                      Visualizza tutti i tipi di esame TOLC disponibili e le relative sezioni
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tolcExamTypesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !tolcExamTypes || tolcExamTypes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nessun tipo di esame TOLC trovato</h3>
                    <p className="text-muted-foreground">
                      Non ci sono tipi di esame TOLC configurati nel sistema.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrizione</TableHead>
                        <TableHead className="text-center">Durata (min)</TableHead>
                        <TableHead className="text-center">Sezioni totali</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tolcExamTypes.map((examType: any) => (
                        <TableRow key={examType.id}>
                          <TableCell className="font-medium">{examType.name}</TableCell>
                          <TableCell className="max-w-xs truncate" title={examType.description}>
                            {examType.description}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              <Timer className="h-3 w-3 mr-1" /> {examType.total_duration}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              <Layers className="h-3 w-3 mr-1" /> {examType.total_sections}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => fetchExamSections(examType.id)}
                              disabled={isLoadingSections}
                            >
                              {isLoadingSections && selectedExamType === examType.id ? (
                                <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full" />
                              ) : (
                                <Eye className="h-4 w-4 mr-2" />
                              )}
                              Visualizza sezioni
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Modal for TOLC Sections */}
          <Dialog open={showSectionsModal} onOpenChange={setShowSectionsModal}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Sezioni dell'esame TOLC</span>
                  <Button variant="ghost" size="icon" onClick={() => setShowSectionsModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  Dettaglio delle sezioni e delle domande disponibili per questo tipo di esame TOLC
                </DialogDescription>
              </DialogHeader>
              
              {isLoadingSections ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : examSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nessuna sezione trovata</h3>
                  <p className="text-muted-foreground">
                    Questo tipo di esame TOLC non ha sezioni configurate.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome sezione</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead className="text-center">Tempo (min)</TableHead>
                      <TableHead className="text-center">Domande in DB</TableHead>
                      <TableHead className="text-center">Domande previste</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examSections.map((section: any) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell className="max-w-xs truncate" title={section.description}>
                          {section.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            <Timer className="h-3 w-3 mr-1" /> {section.time_limit}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={section.actual_question_count > 0 ? "default" : "outline"}>
                            {section.actual_question_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {section.question_count}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSectionsModal(false)}>
                  Chiudi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <CardContent className="h-80">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : analytics?.daily && analytics.daily.length > 0 ? (
                  <div className="h-full">
                    <div className="grid grid-cols-7 gap-1 h-full">
                      {analytics.daily.slice(-7).map((day, index) => {
                        const maxSessions = Math.max(...analytics.daily.map(d => d.totalSessions));
                        const height = maxSessions > 0 ? (day.totalSessions / maxSessions) * 100 : 0;
                        return (
                          <div key={index} className="flex flex-col items-center justify-end h-full">
                            <div 
                              className="bg-primary w-full rounded-t transition-all duration-300 hover:bg-primary/80"
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`${day.date}: ${day.totalSessions} sessioni, ${day.activeUsers} utenti attivi`}
                            />
                            <div className="text-xs text-muted-foreground mt-2 text-center">
                              {new Date(day.date).toLocaleDateString('it-IT', { 
                                weekday: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Sessioni giornaliere - Ultimi 7 giorni
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nessun dato disponibile</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiche generali</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Utenti totali</p>
                      <p className="text-2xl font-bold">{analytics?.users?.total || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Utenti premium</p>
                      <p className="text-2xl font-bold">{analytics?.users?.premium || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Quiz completati oggi</p>
                      <p className="text-2xl font-bold">{analytics?.quizzes?.attemptsToday || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Nuovi utenti oggi</p>
                      <p className="text-2xl font-bold">{analytics?.users?.newToday || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Tentativi totali</p>
                      <p className="text-2xl font-bold">{analytics?.quizzes?.totalAttempts || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Punteggio medio</p>
                      <p className="text-2xl font-bold">{analytics?.quizzes?.averageScore ? `${analytics.quizzes.averageScore.toFixed(1)}%` : '0%'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Statistiche di sistema */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Statistiche di sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-lg font-bold text-green-600">{systemStats?.uptime || 'N/A'}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">Memoria</p>
                    <p className="text-lg font-bold">{systemStats?.memory || 'N/A'}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">CPU</p>
                    <p className="text-lg font-bold">{systemStats?.cpu || 'N/A'}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">DB Size</p>
                    <p className="text-lg font-bold">{systemStats?.dbSize || 'N/A'}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">Connessioni</p>
                    <p className="text-lg font-bold">{systemStats?.activeConnections || 0}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground">Req/min</p>
                    <p className="text-lg font-bold">{systemStats?.requestsPerMinute || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

        {/* Tab Supporto */}
        <TabsContent value="support">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ticket di supporto</span>
                  <Badge variant="secondary">
                    {supportTickets?.filter((t: any) => t.status === 'open').length || 0} aperti
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Gestisci i ticket di supporto degli utenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Utente</TableHead>
                        <TableHead>Oggetto</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Priorità</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supportTickets?.map((ticket: any) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">#{ticket.id}</TableCell>
                          <TableCell>{ticket.user?.email || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'pending' ? 'default' : 'secondary'}>
                              {ticket.status === 'open' ? 'Aperto' : ticket.status === 'pending' ? 'In attesa' : 'Chiuso'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'default' : 'secondary'}>
                              {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Bassa'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizza
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateTicket(ticket.id, 'pending')}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Prendi in carico
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateTicket(ticket.id, 'closed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Chiudi
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nessun ticket di supporto trovato
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Audit Log */}
        <TabsContent value="audit">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Log delle attività amministrative</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Filtra per azione..."
                      value={auditLogFilters.action}
                      onChange={(e) => setAuditLogFilters(prev => ({ ...prev, action: e.target.value }))}
                      className="w-40"
                    />
                    <Input
                      placeholder="Filtra per entità..."
                      value={auditLogFilters.entity}
                      onChange={(e) => setAuditLogFilters(prev => ({ ...prev, entity: e.target.value }))}
                      className="w-40"
                    />
                  </div>
                </CardTitle>
                <CardDescription>
                  Traccia tutte le azioni amministrative eseguite sulla piattaforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Ora</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Azione</TableHead>
                        <TableHead>Entità</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead className="text-right">Dettagli</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs?.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.admin?.email || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action_type}</Badge>
                          </TableCell>
                          <TableCell>{log.entity_type}</TableCell>
                          <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nessun log di audit trovato
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Sistema */}
        <TabsContent value="system">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Impersonificazione utente</CardTitle>
                <CardDescription>
                  Visualizza l'applicazione dal punto di vista di un utente specifico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="ID o email utente..."
                    value={impersonationTarget}
                    onChange={(e) => setImpersonationTarget(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      const userId = parseInt(impersonationTarget) || users?.find((u: any) => u.email === impersonationTarget)?.id;
                      if (userId) handleImpersonateUser(userId);
                    }}
                    disabled={!impersonationTarget}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Impersona
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  L'impersonificazione ti permetterà di vedere l'app come l'utente selezionato
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiche sistema</CardTitle>
                <CardDescription>
                  Informazioni sullo stato del sistema e delle performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                        <p className="text-lg font-bold">{systemStats?.uptime || '99.9%'}</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Memoria</p>
                        <p className="text-lg font-bold">{systemStats?.memory || '2.1GB'}</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">CPU</p>
                        <p className="text-lg font-bold">{systemStats?.cpu || '15%'}</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">DB Size</p>
                        <p className="text-lg font-bold">{systemStats?.dbSize || '1.2GB'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Azioni di sistema</CardTitle>
                <CardDescription>
                  Operazioni di manutenzione e gestione del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Esporta dati utenti
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Backup database
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Pulisci cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog per modifica utente */}
      <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
            <DialogDescription>
              Modifica le informazioni dell'utente selezionato.
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(onSubmitEditUser)} className="space-y-4">
              <FormField
                control={editUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@esempio.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruolo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un ruolo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Utente</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Premium</FormLabel>
                      <FormDescription>
                        L'utente ha accesso alle funzionalità premium
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditingUser(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={editUserMutation.isPending}>
                  {editUserMutation.isPending ? "Salvando..." : "Salva modifiche"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog per visualizzare domande di una materia */}
      <Dialog open={isViewingSubjectQuestions} onOpenChange={setIsViewingSubjectQuestions}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Domande - {selectedSubject?.name}</DialogTitle>
            <DialogDescription>
              Visualizza tutte le domande associate a questa materia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingSubjectQuestions ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : subjectQuestions && subjectQuestions.length > 0 ? (
              <div className="space-y-4">
                {subjectQuestions.map((question: SubjectQuestion, index: number) => {
                  // Parse options with robust error handling
                  let options: Array<{id: string, text: string}> = [];
                  try {
                    if (typeof question.options === 'object' && question.options !== null && !Array.isArray(question.options)) {
                      // Most common case: JSONB from Supabase returns as object {"a": "text", "b": "text"}
                      options = Object.entries(question.options).map(([key, value]) => ({
                        id: key,
                        text: value as string
                      }));
                    } else if (Array.isArray(question.options)) {
                      // If it's already an array, use it directly
                      options = question.options;
                    } else if (typeof question.options === 'string') {
                      // If it's a string, parse it as JSON
                      const parsed = JSON.parse(question.options);
                      if (Array.isArray(parsed)) {
                        options = parsed;
                      } else if (typeof parsed === 'object' && parsed !== null) {
                        // Convert object format {"a": "text", "b": "text"} to array format
                        options = Object.entries(parsed).map(([key, value]) => ({
                          id: key,
                          text: value as string
                        }));
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing options for question', question.id, error);
                    options = [];
                  }
                  
                  return (
                    <Card key={question.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            Domanda #{index + 1}
                          </h4>
                          <div className="flex gap-2">
                            <Badge variant={question.difficulty === 'facile' ? 'secondary' : question.difficulty === 'media' ? 'default' : 'destructive'}>
                              {question.difficulty === 'facile' ? 'Facile' : question.difficulty === 'media' ? 'Medio' : 'Difficile'}
                            </Badge>
                            {question.topic_name && (
                              <Badge variant="outline">{question.topic_name}</Badge>
                            )}
                          </div>
                        </div>
                        <p className="font-medium">{question.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {options.length > 0 ? options.map((option: any, optIndex: number) => {
                            const isCorrect = option.id === question.correct_answer || option.text === question.correct_answer;
                            return (
                              <div 
                                key={optIndex} 
                                className={`p-2 rounded border ${
                                  isCorrect
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                }`}
                              >
                                <span className="font-medium mr-2">{option.id || String.fromCharCode(65 + optIndex)}.</span>
                                {option.text}
                                {isCorrect && (
                                  <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" />
                                )}
                              </div>
                            );
                          }) : (
                            <div className="col-span-2 text-center text-muted-foreground py-4">
                              Nessuna opzione disponibile per questa domanda
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna domanda trovata per questa materia</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewingSubjectQuestions(false)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per modificare una materia */}
      <Dialog open={isEditingSubject} onOpenChange={setIsEditingSubject}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifica Materia</DialogTitle>
            <DialogDescription>
              Modifica le informazioni della materia selezionata.
            </DialogDescription>
          </DialogHeader>
          <Form {...editSubjectForm}>
            <form onSubmit={editSubjectForm.handleSubmit(onSubmitEditSubject)} className="space-y-4">
              <FormField
                control={editSubjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome materia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome della materia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editSubjectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrizione della materia (opzionale)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editSubjectForm.control}
                name="exam_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo di esame</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo di esame" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TOLC-I">TOLC-I</SelectItem>
                        <SelectItem value="TOLC-E">TOLC-E</SelectItem>
                        <SelectItem value="TOLC-F">TOLC-F</SelectItem>
                        <SelectItem value="TOLC-S">TOLC-S</SelectItem>
                        <SelectItem value="TOLC-B">TOLC-B</SelectItem>
                        <SelectItem value="TOLC-SU">TOLC-SU</SelectItem>
                        <SelectItem value="TOLC-PSI">TOLC-PSI</SelectItem>
                        <SelectItem value="TOLC-AV">TOLC-AV</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditingSubject(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={editSubjectMutation.isPending}>
                  {editSubjectMutation.isPending ? "Salvando..." : "Salva modifiche"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal per dettagli ticket */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Dettagli Ticket #{selectedTicket?.id}
            </DialogTitle>
            <DialogDescription>
              Visualizza e gestisci i dettagli del ticket di supporto
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Informazioni principali */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Utente</label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{selectedTicket.user?.email || 'N/A'}</span>
                  </div>
                  {selectedTicket.user?.full_name && (
                    <div className="text-sm text-muted-foreground ml-6">
                      {selectedTicket.user.full_name}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Data creazione</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status e Priorità */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Stato</label>
                  <Badge variant={selectedTicket.status === 'open' ? 'destructive' : selectedTicket.status === 'pending' ? 'default' : 'secondary'}>
                    {selectedTicket.status === 'open' ? 'Aperto' : selectedTicket.status === 'pending' ? 'In attesa' : 'Chiuso'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Priorità</label>
                  <Badge variant={selectedTicket.priority === 'high' ? 'destructive' : selectedTicket.priority === 'medium' ? 'default' : 'secondary'}>
                    {selectedTicket.priority === 'high' ? 'Alta' : selectedTicket.priority === 'medium' ? 'Media' : 'Bassa'}
                  </Badge>
                </div>
              </div>

              {/* Oggetto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Oggetto</label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{selectedTicket.subject}</p>
                </div>
              </div>

              {/* Descrizione */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Descrizione</label>
                <div className="p-4 bg-muted rounded-md min-h-[100px]">
                  <p className="whitespace-pre-wrap">{selectedTicket.description || 'Nessuna descrizione fornita'}</p>
                </div>
              </div>

              {/* Categoria e Tags */}
              {(selectedTicket.category || selectedTicket.tags?.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTicket.category && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                      <Badge variant="outline">{selectedTicket.category}</Badge>
                    </div>
                  )}
                  
                  {selectedTicket.tags?.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedTicket.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Assegnato a */}
              {selectedTicket.assigned_to && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Assegnato a</label>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Admin ID: {selectedTicket.assigned_to}</span>
                  </div>
                </div>
              )}

              {/* Date aggiuntive */}
              <div className="grid grid-cols-2 gap-4">
                {selectedTicket.updated_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Ultimo aggiornamento</label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{new Date(selectedTicket.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                {selectedTicket.closed_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Data chiusura</label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{new Date(selectedTicket.closed_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SLA Breach */}
              {selectedTicket.has_sla_breach && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Violazione SLA</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Questo ticket ha superato i tempi di risposta previsti dal Service Level Agreement.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedTicket?.status === 'open' && (
                <Button 
                  onClick={() => {
                    handleUpdateTicket(selectedTicket.id, 'pending');
                    setSelectedTicket(null);
                  }}
                  variant="default"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Prendi in carico
                </Button>
              )}
              
              {selectedTicket?.status !== 'closed' && (
                <Button 
                  onClick={() => {
                    handleUpdateTicket(selectedTicket.id, 'closed');
                    setSelectedTicket(null);
                  }}
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Chiudi ticket
                </Button>
              )}
            </div>
            
            <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Admin;
