import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { useState } from "react";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "@/context/AuthContext";

interface ExamCountdownProps {
  onSetupExam?: () => void;
}

const ExamCountdown = ({ onSetupExam }: ExamCountdownProps) => {
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch dell'esame dell'utente
  const { data: exam, isLoading } = useQuery({
    queryKey: ['/api/exams'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading">Il tuo esame</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Accedi o registrati per impostare la data del tuo esame e ricevere un piano di studio personalizzato.
            </p>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Accedi ora
            </Button>
            <AuthModal 
              isOpen={isAuthModalOpen} 
              onClose={() => setIsAuthModalOpen(false)} 
              initialMode="login"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading">Il tuo esame</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se non c'è un esame configurato
  if (!exam) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading">Il tuo esame</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Non hai ancora impostato un esame. Configuralo ora per ricevere un piano di studio personalizzato.
            </p>
            <Button onClick={onSetupExam}>
              Configura esame
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading">Il tuo esame</CardTitle>
        <Button variant="ghost" size="icon" onClick={onSetupExam}>
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* TOLC label */}
          <div className="mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
              {exam.examType}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{exam.university}</span>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                {exam.daysRemaining > 0 ? exam.daysRemaining : "0"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">giorni rimanenti</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data esame:</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {new Date(exam.examDate).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <Progress value={65} className="h-2.5" />
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Preparazione completata: 65%</span>
              <span>Obiettivo: {exam.targetScore || 85}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCountdown;
