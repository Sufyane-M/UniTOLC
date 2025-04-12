import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Crown } from "lucide-react";

interface WeakArea {
  id: number;
  userId: number;
  topicId: number;
  accuracy: number;
  lastUpdated: string;
  topic?: {
    id: number;
    name: string;
    subjectId: number;
  }
}

const WeakAreasQuickPractice = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Fetch delle aree di debolezza
  const { data: weakAreas, isLoading } = useQuery<WeakArea[]>({
    queryKey: ['/api/weak-areas'],
    enabled: isAuthenticated,
  });
  
  // Dati statici per dimostrazione
  const staticWeakAreas = [
    { id: 1, topic: { name: "Calcolo integrale" }, accuracy: 45 },
    { id: 2, topic: { name: "Sistemi lineari" }, accuracy: 58 },
    { id: 3, topic: { name: "Elettromagnetismo" }, accuracy: 62 }
  ];
  
  const displayWeakAreas = weakAreas || staticWeakAreas;
  
  // Determinare la classe del colore della barra di progresso
  const getProgressColor = (accuracy: number) => {
    if (accuracy < 50) return "bg-red-500";
    if (accuracy < 65) return "bg-amber-500";
    return "bg-green-500";
  };
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading">Aree di debolezza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3 mb-4">
              <i className="ri-error-warning-line text-2xl text-red-500"></i>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Accedi per identificare e migliorare le tue aree di debolezza con pratica mirata.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading">Aree di debolezza</CardTitle>
          <Link href="/analytics">
            <a className="text-sm font-medium text-primary hover:text-primary-600">
              Vedi tutte
            </a>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading">Aree di debolezza</CardTitle>
        <Link href="/analytics">
          <a className="text-sm font-medium text-primary hover:text-primary-600">
            Vedi tutte
          </a>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayWeakAreas.map((area) => (
            <div key={area.id} className="bg-accent/50 rounded-lg p-3 border border-border">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{area.topic?.name}</span>
                <span className="text-xs text-muted-foreground">{area.accuracy}% corretto</span>
              </div>
              <Progress 
                value={area.accuracy} 
                className="h-1.5 mb-2"
                indicatorClassName={getProgressColor(area.accuracy)} 
              />
              <div className="flex justify-end">
                <Button size="sm" variant="default" className="text-xs">
                  Pratica rapida
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Premium feature teaser */}
        {!user?.isPremium && (
          <div className="mt-5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-primary-400 rounded-full opacity-20"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-primary-700 rounded-full opacity-20"></div>
            
            <h3 className="text-base font-semibold relative z-10">Analisi dettagliata</h3>
            <p className="text-sm text-primary-100 mt-1 mb-3 relative z-10">
              Ottieni un'analisi approfondita delle tue aree di debolezza e piani di studio personalizzati.
            </p>
            <Link href="/settings">
              <Button 
                size="sm" 
                className="relative z-10 bg-white text-primary-700 hover:bg-primary-50"
              >
                <Crown className="h-4 w-4 mr-1.5" /> Passa a Premium
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeakAreasQuickPractice;
