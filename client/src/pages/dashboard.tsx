import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ExamCountdown from "@/components/dashboard/ExamCountdown";
import StudyStreak from "@/components/dashboard/StudyStreak";
import DailyChallenge from "@/components/dashboard/DailyChallenge";
import StudyRecommendations from "@/components/dashboard/StudyRecommendations";
import WeakAreasQuickPractice from "@/components/dashboard/WeakAreasQuickPractice";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

// Schema per il form dell'esame
const examSchema = z.object({
  examType: z.enum(["TOLC-I", "TOLC-E", "TOLC-F", "TOLC-S", "ENGLISH-TOLC"], {
    required_error: "Seleziona il tipo di esame",
  }),
  university: z.string().min(1, "Inserisci l'università"),
  examDate: z.string().min(1, "Seleziona la data dell'esame"),
  targetScore: z.coerce.number().min(1, "Inserisci un punteggio valido").max(100, "Il punteggio massimo è 100")
});

type ExamFormValues = z.infer<typeof examSchema>;

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form per la configurazione dell'esame
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      examType: "TOLC-I",
      university: "",
      examDate: "",
      targetScore: 70
    }
  });
  
  const onSubmitExam = async (data: ExamFormValues) => {
    try {
      await apiRequest("POST", "/api/exams", data);
      
      toast({
        title: "Esame configurato",
        description: "La configurazione del tuo esame è stata salvata con successo.",
      });
      
      // Invalida la query per riottenere i dati aggiornati
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      
      setIsExamModalOpen(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la configurazione dell'esame.",
        variant: "destructive",
      });
    }
  };
  
  // Ottieni la data minima per il datepicker (oggi)
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">
        {isAuthenticated ? "La tua dashboard" : "Benvenuto su TolcPrep"}
      </h1>
      
      <div className="space-y-8">
        {/* Top section: Exam countdown, Study streak and Daily challenge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ExamCountdown onSetupExam={() => setIsExamModalOpen(true)} />
          <StudyStreak />
          <DailyChallenge />
        </div>
        
        {/* Middle section: Study recommendations and Weak areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StudyRecommendations />
          <WeakAreasQuickPractice />
        </div>
        
        {/* Bottom section: Recent activity and Progress overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity />
          <ProgressOverview />
        </div>
      </div>
      
      {/* Modal per la configurazione dell'esame */}
      <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configura il tuo esame</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del tuo prossimo esame TOLC per ricevere un piano di studio personalizzato.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitExam)} className="space-y-4">
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo di esame</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona il tipo di TOLC" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TOLC-I">TOLC-I (Ingegneria)</SelectItem>
                        <SelectItem value="TOLC-E">TOLC-E (Economia)</SelectItem>
                        <SelectItem value="TOLC-F">TOLC-F (Farmacia)</SelectItem>
                        <SelectItem value="TOLC-S">TOLC-S (Scienze)</SelectItem>
                        <SelectItem value="ENGLISH-TOLC">English TOLC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Università</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Politecnico di Milano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data dell'esame</FormLabel>
                    <FormControl>
                      <Input type="date" min={today} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Punteggio obiettivo (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsExamModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">Salva</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
