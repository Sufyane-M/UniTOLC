import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Edit, 
  MoreVertical, 
  Plus, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

// TypeScript interface for question payload - shared with backend
export interface QuestionPayload {
  text: string;
  topicId?: number;
  sectionId?: number;
  difficulty?: 'facile' | 'media' | 'difficile';
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string;
  explanation?: string;
  imageUrl?: string;
  imageAltText?: string;
  isPremium?: boolean;
  active?: boolean;
}

// Schema di validazione per il form della domanda TOLC
const tolcQuestionSchema = z.object({
  text: z.string().min(3, { message: "Il testo deve avere almeno 3 caratteri" }),
  subject: z.enum(["matematica", "logica", "comprensione_verbale", "scienze", "inglese"], {
    required_error: "Seleziona una materia",
  }),
  difficulty: z.enum(["facile", "media", "difficile"]).optional(),
  options: z.array(
    z.object({
      text: z.string().min(1, { message: "L'opzione deve avere un testo" }),
      isCorrect: z.boolean().default(false),
    })
  ).min(2, { message: "Devi inserire almeno 2 opzioni" }),
  correctAnswerIndex: z.number().min(0, "Devi selezionare una risposta corretta"),
  explanation: z.string().optional(),
  imageUrl: z.string().url({ message: "Inserisci un URL valido" }).optional().or(z.literal('')),
}).refine((data) => {
  // Ensure the correctAnswerIndex is valid
  return data.correctAnswerIndex < data.options.length;
}, {
  message: "Indice della risposta corretta non valido",
  path: ["correctAnswerIndex"]
});

type TolcQuestionFormValues = z.infer<typeof tolcQuestionSchema>;

export default function TolcQuestionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20); // Fixed page size of 20 as requested

  // Effetto per il debounce della ricerca
  useEffect(() => {
    // Resetta il timeout precedente se esiste
    if (searchDebounceTimeout.current) {
      clearTimeout(searchDebounceTimeout.current);
    }
    
    // Imposta un nuovo timeout per aggiornare la query di ricerca
    searchDebounceTimeout.current = setTimeout(() => {
      setSearchQuery(searchInput);
      // Torna alla prima pagina quando cambia la ricerca
      setPage(1);
    }, 300); // 300ms di ritardo
    
    // Cleanup: cancella il timeout quando il componente viene smontato o searchInput cambia
    return () => {
      if (searchDebounceTimeout.current) {
        clearTimeout(searchDebounceTimeout.current);
      }
    };
  }, [searchInput]); // Si attiva quando searchInput cambia

  // Form per creazione domanda
  const form = useForm<TolcQuestionFormValues>({
    resolver: zodResolver(tolcQuestionSchema),
    defaultValues: {
      text: "",
      subject: "matematica",
      difficulty: "media",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      explanation: "",
      tags: [],
      imageUrl: "",
    },
  });

  // Fetch delle domande TOLC con paginazione e ricerca lato server
  const { data: questionsData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/tolc-questions", page, pageSize, searchQuery, selectedSubject],
    queryFn: async () => {
      // Costruisci l'URL con i parametri di ricerca e filtro
      let url = `/api/admin/tolc-questions?page=${page}&pageSize=${pageSize}`;
      
      // Aggiungi parametro di ricerca se presente
      if (searchQuery && searchQuery.trim() !== '') {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      
      // Aggiungi parametro di filtro per materia se selezionata
      if (selectedSubject) {
        url += `&subject=${encodeURIComponent(selectedSubject)}`;
      }
      
      const res = await fetch(url, {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Mutation per aggiungere una domanda
  const addQuestionMutation = useMutation({
    mutationFn: async (data: TolcQuestionFormValues) => {
      // Map subject to sectionId
      const subjectToSectionId: Record<string, number> = {
        "matematica": 1,
        "logica": 5,
        "comprensione_verbale": 6,
        "scienze": 3,
        "inglese": 4
      };

      // Find the correct answer text using the correctAnswerIndex
      const correctOption = data.options[data.correctAnswerIndex];
      if (!correctOption || !correctOption.text.trim()) {
        throw new Error("Devi selezionare una risposta corretta valida");
      }

      // Update options to mark the correct one
      const updatedOptions = data.options.map((option, index) => ({
        ...option,
        isCorrect: index === data.correctAnswerIndex
      }));

      // Transform data to match backend schema (QuestionPayload interface)
      const payload: QuestionPayload = {
        text: data.text,
        sectionId: subjectToSectionId[data.subject],
        topicId: null, // Explicitly set to null for TOLC questions to satisfy check constraint
        difficulty: data.difficulty,
        options: updatedOptions,
        correctAnswer: correctOption.text,
        explanation: data.explanation || undefined,
        imageUrl: data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : undefined,
        isPremium: false,
        active: true
      };

      // Debug logging
      console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      const res = await fetch('/api/admin/tolc-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        console.error('Backend error:', JSON.stringify(errorResponse, null, 2));

        let errorMessage = 'Errore imprevisto durante l\'aggiornamento della domanda.';
        if (errorResponse) {
          if (errorResponse.message && errorResponse.error && typeof errorResponse.error === 'string') {
            errorMessage = `${errorResponse.message}: ${errorResponse.error}`;
          } else if (errorResponse.message) {
            errorMessage = errorResponse.message;
          } else if (errorResponse.error && typeof errorResponse.error === 'string'){
            errorMessage = errorResponse.error;
          } else if (errorResponse.issues && Array.isArray(errorResponse.issues)) {
            errorMessage = errorResponse.issues.map((issue: any) => 
              `${issue.path?.join('.') || 'Campo'}: ${issue.message}`
            ).join('; ');
            errorMessage = `Errori di validazione: ${errorMessage}`;
          }
        }
        throw new Error(errorMessage);
      }

      return res.json();
    },
    onSuccess: (newQuestion) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tolc-questions"] });
      toast({
        title: "Domanda aggiunta",
        description: "La domanda è stata aggiunta con successo",
      });
      setIsAddingQuestion(false);
      form.reset();
      // Reset to first page to see the new question
      setPage(1);
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : 'Errore imprevisto, riprova più tardi.',
        variant: "destructive",
      });
    },
  });

  // Mutation per eliminare una domanda
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      // Implementazione reale: chiamata API per eliminare la domanda
      console.log("Deleting question:", questionId);
      // Simulazione di una chiamata API
      return new Promise(resolve => setTimeout(() => resolve(questionId), 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tolc-questions"] });
      toast({
        title: "Domanda eliminata",
        description: "La domanda è stata eliminata con successo",
      });
      // If we're on the last page and it becomes empty after deletion, go to previous page
      if (questions.length === 1 && page > 1) {
        setPage(p => p - 1);
      }
    },
  });

  // Mutation per aggiornare una domanda
  const updateQuestionMutation = useMutation({
    mutationFn: async (data: TolcQuestionFormValues & { id: number }) => {
      // Map subject to sectionId
      const subjectToSectionId: Record<string, number> = {
        "matematica": 1,
        "logica": 5,
        "comprensione_verbale": 6,
        "scienze": 3,
        "inglese": 4
      };

      // Find the correct answer text using the correctAnswerIndex
      const correctOption = data.options[data.correctAnswerIndex];
      if (!correctOption || !correctOption.text.trim()) {
        throw new Error("Devi selezionare una risposta corretta valida");
      }

      // Update options to mark the correct one
      const updatedOptions = data.options.map((option, index) => ({
        ...option,
        isCorrect: index === data.correctAnswerIndex
      }));

      // Transform data to match backend schema (QuestionPayload interface)
      const payload: QuestionPayload = {
        text: data.text,
        sectionId: subjectToSectionId[data.subject],
        topicId: null, // Explicitly set to null for TOLC questions to satisfy check constraint
        difficulty: data.difficulty,
        options: updatedOptions,
        correctAnswer: correctOption.text,
        explanation: data.explanation || undefined,
        imageUrl: data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : undefined,
        isPremium: false,
        active: true
      };

      // Debug logging
      console.log('Updating question:', JSON.stringify(payload, null, 2));

      const res = await fetch(`/api/admin/tolc-questions/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        console.error('Backend error:', JSON.stringify(errorResponse, null, 2));

        let errorMessage = 'Errore imprevisto durante l\'aggiornamento della domanda.';
        if (errorResponse) {
          if (errorResponse.message && errorResponse.error && typeof errorResponse.error === 'string') {
            errorMessage = `${errorResponse.message}: ${errorResponse.error}`;
          } else if (errorResponse.message) {
            errorMessage = errorResponse.message;
          } else if (errorResponse.error && typeof errorResponse.error === 'string'){
            errorMessage = errorResponse.error;
          } else if (errorResponse.issues && Array.isArray(errorResponse.issues)) {
            errorMessage = errorResponse.issues.map((issue: any) => 
              `${issue.path?.join('.') || 'Campo'}: ${issue.message}`
            ).join('; ');
            errorMessage = `Errori di validazione: ${errorMessage}`;
          }
        }
        throw new Error(errorMessage);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tolc-questions"] });
      toast({
        title: "Domanda aggiornata",
        description: "La domanda è stata aggiornata con successo",
      });
      setIsEditingQuestion(false);
      setCurrentQuestion(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : 'Errore imprevisto, riprova più tardi.',
        variant: "destructive",
      });
    },
  });

  const onSubmitQuestion = (data: TolcQuestionFormValues) => {
    if (isEditingQuestion && currentQuestion) {
      updateQuestionMutation.mutate({ ...data, id: currentQuestion.id });
    } else {
      addQuestionMutation.mutate(data);
    }
  };

  // Funzione per aprire il modale di modifica
  const handleEditQuestion = (question: any) => {
    // Mappa sectionId a subject
    const sectionIdToSubject: Record<number, string> = {
      1: "matematica",
      5: "logica",
      6: "comprensione_verbale",
      3: "scienze",
      4: "inglese"
    };

    // Log the question data to debug
    console.log('Editing question:', JSON.stringify(question, null, 2));
    
    // Prepara le opzioni con isCorrect basato sulla risposta corretta
    const correctAnswerText = question.correct_answer || question.correctAnswer;
    const options = question.options.map((option: any) => ({
      text: option.text,
      isCorrect: option.text === correctAnswerText
    }));
    
    // Find the index of the correct answer
    const correctAnswerIndex = options.findIndex(option => option.isCorrect);
    
    // Log the prepared options to debug
    console.log('Prepared options:', JSON.stringify(options, null, 2));
    console.log('Correct answer:', correctAnswerText);
    console.log('Correct answer index:', correctAnswerIndex);

    // Precompila il form con i dati della domanda
    form.reset({
      text: question.text,
      subject: sectionIdToSubject[question.section_id || question.sectionId] || "matematica",
      difficulty: question.difficulty || "media",
      options: options.length > 0 ? options : [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
      explanation: question.explanation || "",
      imageUrl: question.image_url || question.imageUrl || "",
    });

    setCurrentQuestion(question);
    setIsEditingQuestion(true);
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm("Sei sicuro di voler eliminare questa domanda?")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  // Funzione per aggiungere un'opzione al form
  const addOption = () => {
    const currentOptions = form.getValues("options") || [];
    form.setValue("options", [...currentOptions, { text: "", isCorrect: false }]);
  };

  // Funzione per rimuovere un'opzione dal form
  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options") || [];
    if (currentOptions.length <= 2) {
      toast({
        title: "Attenzione",
        description: "Devi avere almeno 2 opzioni",
        variant: "destructive",
      });
      return;
    }
    
    const currentCorrectIndex = form.getValues("correctAnswerIndex");
    const newOptions = currentOptions.filter((_, i) => i !== index);
    
    // Adjust correctAnswerIndex if necessary
    let newCorrectIndex = currentCorrectIndex;
    if (currentCorrectIndex === index) {
      // If we're removing the correct answer, reset to first option
      newCorrectIndex = 0;
    } else if (currentCorrectIndex > index) {
      // If correct answer is after the removed option, decrement index
      newCorrectIndex = currentCorrectIndex - 1;
    }
    
    form.setValue("options", newOptions);
    form.setValue("correctAnswerIndex", newCorrectIndex);
  };

  // Estrai i dati dalla risposta paginata
  const questions = questionsData?.data || [];
  const totalQuestions = questionsData?.total || 0;
  const totalPages = Math.ceil(totalQuestions / pageSize);
  
  // Usa direttamente i risultati dal server senza filtrarli ulteriormente
  // poiché il filtraggio viene ora fatto lato server
  const displayQuestions = questions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold">Gestione Domande TOLC</h1>
        <Dialog 
          open={isAddingQuestion || isEditingQuestion} 
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingQuestion(false);
              setIsEditingQuestion(false);
              setCurrentQuestion(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsAddingQuestion(true);
              setIsEditingQuestion(false);
              setCurrentQuestion(null);
              form.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" /> Aggiungi domanda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                {isEditingQuestion ? "Modifica domanda TOLC" : "Aggiungi nuova domanda TOLC"}
              </DialogTitle>
              <DialogDescription>
                {isEditingQuestion 
                  ? "Modifica i dettagli della domanda selezionata" 
                  : "Inserisci i dettagli della domanda da aggiungere al database TOLC"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitQuestion)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testo della domanda</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Inserisci il testo della domanda" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Materia</FormLabel>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="matematica">Matematica</option>
                          <option value="logica">Logica</option>
                          <option value="comprensione_verbale">Comprensione verbale</option>
                          <option value="scienze">Scienze</option>
                          <option value="inglese">Inglese</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficoltà</FormLabel>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="facile">Facile</option>
                          <option value="media">Media</option>
                          <option value="difficile">Difficile</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormLabel>Opzioni di risposta</FormLabel>
                  <FormField
                    control={form.control}
                    name="correctAnswerIndex"
                    render={({ field }) => (
                      <FormItem className="space-y-3 mt-2">
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                            className="space-y-2"
                          >
                            {form.watch("options")?.map((_, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <div className="flex items-center space-x-2 mt-2">
                                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                  <label htmlFor={`option-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Corretta
                                  </label>
                                </div>
                                <FormField
                                  control={form.control}
                                  name={`options.${index}.text`}
                                  render={({ field: textField }) => (
                                    <FormItem className="flex-grow">
                                      <FormControl>
                                        <Input placeholder={`Opzione ${index + 1}`} {...textField} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeOption(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2 mt-2">
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Aggiungi opzione
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spiegazione (opzionale)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Inserisci una spiegazione per la risposta corretta" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={addQuestionMutation.isPending || updateQuestionMutation.isPending}
                  >
                    {(addQuestionMutation.isPending || updateQuestionMutation.isPending) 
                      ? "Salvataggio..." 
                      : "Salva domanda"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Domande TOLC</CardTitle>
              <CardDescription>
                Gestisci le domande per i test TOLC
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cerca domande..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" /> Filtra
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedSubject(null)}>Tutte le materie</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSubject("matematica")}>Matematica</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSubject("logica")}>Logica</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSubject("comprensione_verbale")}>Comprensione verbale</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSubject("scienze")}>Scienze</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSubject("inglese")}>Inglese</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Errore nel caricamento delle domande</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Errore sconosciuto'}
              </p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Riprova
              </Button>
            </div>
          ) : displayQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Nessuna domanda trovata</h3>
              <p className="text-muted-foreground">
                Non ci sono domande TOLC nel database. Aggiungi la tua prima domanda!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Testo</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead>Difficoltà</TableHead>
                    <TableHead>Opzioni</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayQuestions.map((question: any) => (
                    <TableRow key={question.id}>
                      <TableCell>{question.id}</TableCell>
                      <TableCell className="max-w-xs truncate">{question.text}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {question.topics?.name || (question.subject ? question.subject.replace("_", " ") : "")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`capitalize ${question.difficulty ? (question.difficulty === 'facile' ? 'bg-green-500' : question.difficulty === 'media' ? 'bg-amber-500' : 'bg-red-500') : ''}`}
                        >
                          {question.difficulty || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.options?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                              <Edit className="h-4 w-4 mr-2" /> Modifica
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteQuestion(question.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Elimina
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
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {displayQuestions.length} domande di {totalQuestions} totali
            {selectedSubject && ` di ${selectedSubject.replace("_", " ")}`}
            {searchQuery && ` per la ricerca "${searchQuery}"`}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              ‹ Precedente
            </Button>
            
            <span className="text-sm">
              Pagina {page} di {totalPages || 1}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Successiva ›
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => {
            setSearchInput("");
            setSearchQuery("");
            setSelectedSubject(null);
            setPage(1); // Reset to first page when clearing filters
          }}>
            Reimposta filtri
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}