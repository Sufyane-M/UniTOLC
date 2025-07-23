import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/hooks/use-supabase";

import LiveSimulation from "@/components/practice/LiveSimulation";
import ResultsModal from "@/components/practice/ResultsModal";

import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Info, AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";

// Types
interface ExamType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  total_duration: number;
  total_sections: number;
}

interface ExamSection {
  id: number;
  exam_type_id: number;
  code: string;
  name: string;
  description: string | null;
  time_limit: number;
  question_count: number;
  sort_order: number;
}

interface Question {
  id: number;
  section_id: number;
  text: string;
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string | null;
  image_url?: string;
  image_alt_text?: string;
}

interface SimulationSession {
  id: number;
  user_id: string;
  exam_type_id: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  metadata: any;
}

interface SectionAttempt {
  id: number;
  session_id: number;
  section_id: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  time_spent: number | null;
  score: any;
  answers: { [key: string]: string };
}

interface SimulationResults {
  session_id: number;
  exam_type: string;
  completion_time: string;
  sections: Array<{
    name: string;
    score: {
      raw: number;
      total_questions: number;
      correct: number;
      incorrect: number;
      unanswered: number;
      max_score: number;
    };
    time_spent: number;
  }>;
  overall_score: number;
}

// Main component
const FullSimulation = () => {
  // State
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<number | null>(null);
  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const [agreeToRules, setAgreeToRules] = useState(false);
  const [simLoaded, setSimLoaded] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasUnfinishedSession, setHasUnfinishedSession] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState<number | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  
  // Hooks
  const { user, supabaseUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const supabase = useSupabase();
  
  // Fetch exam types on load
  useEffect(() => {
    fetchExamTypes();
    checkForUnfinishedSession();
  }, [user]);
  
  // Fetch exam sections when an exam type is selected
  useEffect(() => {
    if (selectedExamType) {
      fetchExamSections(selectedExamType);
    }
  }, [selectedExamType]);
  
  // Fetch available exam types
  const fetchExamTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('tolc_exam_types')
        .select('*');
        
      if (error) throw error;
      setExamTypes(data || []);
    } catch (error) {
      console.error('Error fetching exam types:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i tipi di esame TOLC",
        variant: "destructive",
      });
    }
  };
  
  // Fetch sections for selected exam type
  const fetchExamSections = async (examTypeId: number) => {
    try {
      const { data, error } = await supabase
        .from('tolc_exam_sections')
        .select('*')
        .eq('exam_type_id', examTypeId)
        .order('sort_order', { ascending: true });
        
      if (error) throw error;
      setExamSections(data || []);
    } catch (error) {
      console.error('Error fetching exam sections:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le sezioni dell'esame",
        variant: "destructive",
      });
    }
  };
  
  // Check if user has an unfinished simulation session
  const checkForUnfinishedSession = async () => {
    if (!user || !supabaseUser) return;
    
    try {
      const { data, error } = await supabase
        .from('tolc_simulation_sessions')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setHasUnfinishedSession(true);
        setResumeSessionId(data[0].id);
        setShowResumeDialog(true);
      }
    } catch (error) {
      console.error('Error checking for unfinished sessions:', error);
    }
  };
  
  // Start a new simulation
  const startSimulation = async () => {
    if (!user || !supabaseUser || !selectedExamType) return;
    
    try {
      // Create a new simulation session
      const { data: sessionData, error: sessionError } = await supabase
        .from('tolc_simulation_sessions')
        .insert({
          user_id: supabaseUser.id,
          exam_type_id: selectedExamType,
          status: 'in_progress',
          metadata: {
            browser: navigator.userAgent,
            platform: navigator.platform
          }
        })
        .select();
        
      if (sessionError) throw sessionError;
      
      if (!sessionData || sessionData.length === 0) {
        throw new Error('No session data returned');
      }
      
      const sessionId = sessionData[0].id;
      setCurrentSessionId(sessionId);
      
      // Fetch questions for this exam type
      const { data: questionsData, error: questionsError } = await supabase
        .rpc('get_randomized_tolc_questions', { 
          p_exam_type_id: selectedExamType 
        });
        
      if (questionsError) throw questionsError;
      
      // Create section attempts for each section
      for (const section of examSections) {
        const { error: sectionError } = await supabase
          .from('tolc_section_attempts')
          .insert({
            session_id: sessionId,
            section_id: section.id,
            status: section.sort_order === 1 ? 'in_progress' : 'pending',
          });
          
        if (sectionError) throw sectionError;
      }
      
      // Store questions in state and show live simulation
      setQuestions(questionsData || []);
      setSimLoaded(true);
      
    } catch (error) {
      console.error('Error starting simulation:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare la simulazione",
        variant: "destructive",
      });
    }
  };
  
  // Resume an existing simulation
  const resumeSimulation = async () => {
    if (!resumeSessionId) return;
    
    try {
      // Fetch session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('tolc_simulation_sessions')
        .select('*')
        .eq('id', resumeSessionId)
        .single();
        
      if (sessionError) throw sessionError;
      
      // Fetch questions for this exam type
      const { data: questionsData, error: questionsError } = await supabase
        .rpc('get_randomized_tolc_questions', { 
          p_exam_type_id: sessionData.exam_type_id 
        });
        
      if (questionsError) throw questionsError;
      
      // Set state and continue to simulation
      setSelectedExamType(sessionData.exam_type_id);
      setQuestions(questionsData || []);
      setCurrentSessionId(resumeSessionId);
      setSimLoaded(true);
      setShowResumeDialog(false);
      
    } catch (error) {
      console.error('Error resuming simulation:', error);
      toast({
        title: "Errore",
        description: "Impossibile riprendere la simulazione",
        variant: "destructive",
      });
    }
  };
  
  // Handle completion of the simulation
  const handleSimulationComplete = (results: SimulationResults) => {
    setSimulationResults(results);
    setShowResultsModal(true);
  };
  
  // Handle closing the results modal
  const handleCloseResultsModal = () => {
    setShowResultsModal(false);
    setSimLoaded(false);
    setSelectedExamType(null);
    setAgreeToRules(false);
  };
  
  // Find the selected exam type name
  const selectedExamTypeName = examTypes.find(et => et.id === selectedExamType)?.name || '';
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/practice">Pratica</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Simulazione Completa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {!simLoaded ? (
        <>
          {/* SimulationInfoSection */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-3">Simulazione Completa TOLC</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Questa simulazione riproduce fedelmente l'esame CISIA: nessun ritorno indietro tra le sezioni, 
              tempo fisso per sezione e penalità per le risposte errate.
            </p>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Seleziona tipo di TOLC</CardTitle>
                <CardDescription>
                  Scegli il tipo di test TOLC che vuoi simulare.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Select onValueChange={(value) => setSelectedExamType(Number(value))}>
                      <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Seleziona tipo di TOLC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Tipi di TOLC disponibili</SelectLabel>
                          {examTypes.map((examType) => (
                            <SelectItem key={examType.id} value={examType.id.toString()}>
                              {examType.name} ({examType.code}) - {examType.total_duration} minuti
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  

                </div>
              </CardContent>
            </Card>
          
            {/* RulesSummaryAccordion */}
            {selectedExamType && (
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="rules">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Info size={18} />
                      <span>Regole e tempi del TOLC {selectedExamTypeName}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Durata delle sezioni:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {examSections.map((section) => (
                            <li key={section.id}>
                              {section.name}: {section.time_limit} minuti per {section.question_count} domande
                            </li>
                          ))}
                        </ul>
                      </div>
                    
                      <div>
                        <h4 className="font-semibold mb-2">Sistema di valutazione:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Risposta corretta: <span className="font-semibold text-green-600 dark:text-green-400">+1 punto</span></li>
                          <li>Risposta errata: <span className="font-semibold text-red-600 dark:text-red-400">-0.25 punti</span></li>
                          <li>Risposta non data: <span className="font-semibold">0 punti</span></li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Regole di navigazione:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li className="text-amber-700 dark:text-amber-400 font-medium">
                            Non è possibile tornare a una sezione precedente una volta completata
                          </li>
                          <li>Ogni sezione ha un tempo limitato e indipendente</li>
                          <li>È possibile modificare le risposte solo all'interno della stessa sezione</li>
                          <li>Una volta completate tutte le sezioni, l'esame è concluso</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Regole su pause:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Non sono previste pause durante lo svolgimento di una sezione</li>
                          <li>È possibile una breve pausa (massimo 5 minuti) tra una sezione e l'altra</li>
                        </ul>
                      </div>
                      
                      <div className="pt-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Riferimento: Regolamento TOLC - Art. 5, Commi 2,3,4
                        </Badge>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
            {/* Checkbox di conferma - spostato dopo le regole */}
            {selectedExamType && (
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox 
                  id="agree-rules" 
                  checked={agreeToRules}
                  onCheckedChange={(checked) => setAgreeToRules(checked as boolean)}
                />
                <label
                  htmlFor="agree-rules"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ho compreso le regole ufficiali del TOLC {selectedExamTypeName} e accetto di svolgere la simulazione completa
                </label>
              </div>
            )}
            
            {/* Start button */}
            <div className="mt-8 flex justify-center">
              <Button 
                size="lg" 
                disabled={!selectedExamType || !agreeToRules}
                onClick={startSimulation}
                className="gap-2"
              >
                Inizia Simulazione Completa <ArrowRight size={18} />
              </Button>
            </div>
          </div>
          
          {/* Footer with useful links */}
          <div className="border-t pt-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Link utili</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <a 
                href="https://www.cisiaonline.it/area-tematica-tolc-cisia/regolamenti/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                <span>Regolamento ufficiale TOLC</span>
              </a>
              <a 
                href="https://www.cisiaonline.it/area-tematica-tolc-cisia/come-prepararsi-ai-tolc/materialedidattico/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                <span>Materiale didattico CISIA</span>
              </a>
              <a 
                href="https://www.cisiaonline.it/faq-frequently-asked-questions/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                <span>FAQ sul TOLC</span>
              </a>
            </div>
          </div>
        </>
      ) : (
        // LiveSimulation component
        <LiveSimulation 
          sessionId={currentSessionId!}
          examTypeId={selectedExamType!}
          questions={questions}
          onComplete={handleSimulationComplete}
        />
      )}
      
      {/* Resume session dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulazione in corso</DialogTitle>
            <DialogDescription>
              Hai una simulazione TOLC già iniziata. Vuoi riprenderla o iniziarne una nuova?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowResumeDialog(false)}>
              Inizia nuova simulazione
            </Button>
            <Button onClick={resumeSimulation}>
              Riprendi simulazione
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Results Modal */}
      {simulationResults && (
        <ResultsModal 
          isOpen={showResultsModal}
          onClose={handleCloseResultsModal}
          results={simulationResults}
        />
      )}
    </div>
  );
};

export default FullSimulation;