import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  CreditCard,
  Ticket,
  Calendar,
  User
} from "lucide-react";

const supportTicketSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve avere almeno 2 caratteri" }),
  email: z.string().email({ message: "Inserisci un'email valida" }),
  subject: z.string().min(5, { message: "L'oggetto deve avere almeno 5 caratteri" }),
  description: z.string().min(20, { message: "La descrizione deve avere almeno 20 caratteri" }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Seleziona una priorità",
  }),
  category: z.string().optional(),
});

type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;

interface UserTicket {
  id: number;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'closed';
  category?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'destructive';
    case 'pending': return 'default';
    case 'closed': return 'secondary';
    default: return 'default';
  }
};

const Support = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Query per recuperare i ticket dell'utente
  const { data: userTickets, isLoading: ticketsLoading, refetch: refetchTickets } = useQuery({
    queryKey: ['/api/support/tickets'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/support/tickets');
      return response.json() as Promise<UserTicket[]>;
    },
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per accedere al supporto.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, setLocation, toast]);

  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      name: user?.fullName || user?.username || "",
      email: user?.email || "",
      subject: "",
      description: "",
      priority: "medium",
      category: "",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.setValue("name", user.fullName || user.username || "");
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: SupportTicketFormValues) => {
      const ticketData = {
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        category: data.category,
      };
      return apiRequest("POST", "/api/support/tickets", ticketData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      refetchTickets(); // Aggiorna la lista dei ticket
      toast({
        title: "Ticket inviato con successo",
        description: "Il tuo ticket è stato creato. Ti risponderemo il prima possibile.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore nell'invio del ticket",
        description: error.message || "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportTicketFormValues) => {
    createTicketMutation.mutate(data);
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-lg">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-heading font-bold text-green-700">
                Ticket inviato con successo!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Grazie per averci contattato. Il tuo ticket è stato registrato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Cosa succede ora?</strong>
                </p>
                <ul className="text-sm text-green-600 dark:text-green-400 mt-2 space-y-1">
                  <li>• Il nostro team esaminerà la tua richiesta</li>
                  <li>• Riceverai una risposta via email entro 24-48 ore</li>
                  <li>• Puoi controllare lo stato del ticket nella tua dashboard</li>
                </ul>
              </div>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                Invia un altro ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">
            Centro di Supporto
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Hai bisogno di aiuto? Siamo qui per te. Invia un ticket di supporto o consulta le nostre FAQ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form principale */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Invia un ticket di supporto
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Descrivi il tuo problema in dettaglio e ti aiuteremo a risolverlo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Nome */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Il tuo nome completo..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="La tua email..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Categoria */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona una categoria (opzionale)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="account">Account e Login</SelectItem>
                              <SelectItem value="payment">Pagamenti e Abbonamenti</SelectItem>
                              <SelectItem value="technical">Problemi Tecnici</SelectItem>
                              <SelectItem value="content">Contenuti e Quiz</SelectItem>
                              <SelectItem value="general">Domande Generali</SelectItem>
                              <SelectItem value="feedback">Feedback e Suggerimenti</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Oggetto */}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oggetto *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Riassumi brevemente il tuo problema..."
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Inserisci un titolo chiaro e descrittivo per il tuo problema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priorità */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priorità *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona la priorità" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Bassa - Domanda generale
                                </div>
                              </SelectItem>
                              <SelectItem value="medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Media - Problema che limita l'uso
                                </div>
                              </SelectItem>
                              <SelectItem value="high">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  Alta - Problema critico
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Descrizione */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione dettagliata *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrivi il problema in dettaglio. Includi i passaggi per riprodurlo, messaggi di errore, e qualsiasi altra informazione utile..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Più dettagli fornisci, più velocemente potremo aiutarti.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Info utente */}
                    {user && (
                      <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">Informazioni account</h4>
                        <div className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
                          <p><strong>Email:</strong> {user.email}</p>
                          {user.full_name && <p><strong>Nome:</strong> {user.full_name}</p>}
                          <p><strong>Tipo account:</strong> {user.is_premium ? 'Premium' : 'Gratuito'}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Invia ticket
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con informazioni */}
          <div className="space-y-6">
            {/* FAQ rapide */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  FAQ Rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-primary pl-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Come resetto la password?</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Vai alla pagina di login e clicca "Password dimenticata"</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Come attivo Premium?</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Vai nelle Impostazioni e scegli un piano di abbonamento</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">I quiz non si caricano</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Prova a ricaricare la pagina o svuotare la cache</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tempi di risposta */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Clock className="h-5 w-5 text-primary" />
                  Tempi di Risposta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="destructive" className="w-16 justify-center">Alta</Badge>
                  <span className="text-sm">2-4 ore</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="w-16 justify-center">Media</Badge>
                  <span className="text-sm">12-24 ore</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-16 justify-center">Bassa</Badge>
                  <span className="text-sm">24-48 ore</span>
                </div>
              </CardContent>
            </Card>

            {/* Contatti alternativi */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Mail className="h-5 w-5 text-primary" />
                  Altri Contatti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email diretta</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">support@studentexamprep.it</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Telefono</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">+39 02 1234 5678</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Orari: Lun-Ven 9:00-18:00
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sezione Ticket Esistenti */}
        <div className="mt-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Ticket className="h-5 w-5 text-primary" />
                I tuoi ticket
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Visualizza e monitora lo stato dei tuoi ticket di supporto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Caricamento ticket...</span>
                </div>
              ) : userTickets && userTickets.length > 0 ? (
                <div className="space-y-4">
                  {userTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(ticket.priority) as any}>
                              {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Bassa'}
                            </Badge>
                            <Badge variant={getStatusColor(ticket.status) as any}>
                              {ticket.status === 'open' ? 'Aperto' : ticket.status === 'pending' ? 'In attesa' : 'Chiuso'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Creato: {formatDate(ticket.created_at)}
                          </span>
                          {ticket.category && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {ticket.category}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 dark:text-gray-500">
                          #{ticket.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Non hai ancora creato nessun ticket
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    I tuoi ticket di supporto appariranno qui una volta creati.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;