import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const TestResults = () => {
  const [, setLocation] = useLocation();

  const mockResults = {
    exam_type: 'I',
    overall_score: 28.5,
    sections: [
      {
        name: 'Matematica',
        score: { raw: 12.5, max_score: 15, correct: 10, incorrect: 3, unanswered: 2 },
        time_spent: 1800
      },
      {
        name: 'Logica',
        score: { raw: 8.0, max_score: 10, correct: 8, incorrect: 2, unanswered: 0 },
        time_spent: 900
      },
      {
        name: 'Scienze',
        score: { raw: 8.0, max_score: 15, correct: 6, incorrect: 4, unanswered: 5 },
        time_spent: 1200
      }
    ],
    questions: []
  };

  const handleNavigateToResults = () => {
    // Salva i dati mock nel localStorage
    localStorage.setItem('simulationResults', JSON.stringify(mockResults));
    // Naviga alla pagina dei risultati
    setLocation('/results');
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test della Pagina Risultati</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Questa è una pagina di test per verificare il funzionamento della nuova pagina dei risultati.
          </p>
          <Button onClick={handleNavigateToResults}>
            Vai alla Pagina Risultati (con dati mock)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResults;