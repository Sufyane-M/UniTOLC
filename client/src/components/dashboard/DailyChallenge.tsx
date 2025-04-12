import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  targetId?: number;
  xpReward: number;
  difficulty: string;
  completed: boolean;
}

const DailyChallenge = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch delle sfide giornaliere
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['/api/daily-challenges'],
    enabled: isAuthenticated,
  });
  
  // Mutation per completare una sfida
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      await apiRequest('POST', `/api/daily-challenges/${challengeId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-challenges'] });
      toast({
        title: 'Sfida completata!',
        description: 'Hai guadagnato XP e progredito nella tua preparazione.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: 'Non è stato possibile completare la sfida. Riprova più tardi.',
        variant: 'destructive',
      });
    },
  });
  
  // Trova la sfida in corso e le sfide completate
  const activeChallenge = challenges?.find(c => !c.completed);
  const completedChallenges = challenges?.filter(c => c.completed).slice(0, 2);
  
  const handleStartChallenge = (challenge: Challenge) => {
    if (challenge.type === 'quiz' && challenge.targetId) {
      setLocation(`/practice/quiz/${challenge.targetId}`);
    } else {
      // Completa direttamente sfide di tipo non-quiz
      completeChallengeMutation.mutate(challenge.id);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading">Sfida giornaliera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3 mb-4">
              <i className="ri-award-line text-2xl text-primary-500"></i>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Accedi per sbloccare sfide giornaliere e guadagnare XP completandole.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading">Sfida giornaliera</CardTitle>
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
        <CardTitle className="text-lg font-heading">Sfida giornaliera</CardTitle>
        {activeChallenge && (
          <Badge variant="outline" className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
            <i className="ri-award-line mr-1"></i> +{activeChallenge.xpReward} XP
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {activeChallenge ? (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
            <h3 className="font-heading font-semibold text-base mb-2">{activeChallenge.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{activeChallenge.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Difficoltà: {activeChallenge.difficulty.charAt(0).toUpperCase() + activeChallenge.difficulty.slice(1)}
              </span>
              <Button
                size="sm"
                onClick={() => handleStartChallenge(activeChallenge)}
                disabled={completeChallengeMutation.isPending}
              >
                {completeChallengeMutation.isPending ? "Completamento..." : "Inizia sfida"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4 text-center">
            <h3 className="font-heading font-semibold text-base mb-2">Complimenti!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Hai completato tutte le sfide di oggi. Torna domani per nuove sfide!
            </p>
          </div>
        )}
        
        {(completedChallenges && completedChallenges.length > 0) && (
          <>
            <Separator className="my-4" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sfide completate oggi:
            </h3>
            <div className="space-y-2">
              {completedChallenges.map(challenge => (
                <div key={challenge.id} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">{challenge.title}</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">+{challenge.xpReward} XP</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyChallenge;
